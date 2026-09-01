import { Order } from "./order.model.js";
import { MenuItem } from "../restaurants/menuItem.model.js";
import { Restaurant } from "../restaurants/restaurant.model.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../../shared/utils/error.js";
import { Types } from "mongoose";
import {
  ActorState,
  canTransition,
  OrderStatus,
  TRANSITION_ACTORS,
} from "@dispatchx/shared";
import { publishToOrderTimeoutDelayQueue } from "../../configs/rabbitmq.js";

interface IncomingItem {
  menuItemId: string;
  quantity: number;
}

const createOrder = async (
  customerId: Types.ObjectId | string,
  restaurantId: Types.ObjectId | string,
  incomingItems: IncomingItem[]
) => {
  const restaurant = await Restaurant.findById(restaurantId);

  if (!restaurant) {
    throw new NotFoundError("Restaurant not found");
  }

  const menuItemIds = incomingItems.map((i) => i.menuItemId);
  const menuItems = await MenuItem.find({
    _id: { $in: menuItemIds },
    restaurantId,
  });

  if (menuItems.length !== incomingItems.length) {
    throw new BadRequestError(
      "One or more items do not belong to this restaurant"
    );
  }

  const items = incomingItems.map((incoming) => {
    const menuItem = menuItems.find(
      (m) => m._id.toString() === incoming.menuItemId
    )!;

    if (!menuItem.isAvailable) {
      throw new BadRequestError(
        `${menuItem.itemName} is currently unavailable`
      );
    }
    if (incoming.quantity < 1) {
      throw new BadRequestError("Quantity must be at least 1");
    }

    return {
      menuItemId: menuItem._id,
      itemName: menuItem.itemName,
      itemPrice: menuItem.itemPrice,
      quantity: incoming.quantity,
    };
  });

  const totalPrice = items.reduce(
    (sum, item) => sum + item.itemPrice * item.quantity,
    0
  );

  const order = await Order.create({
    customerId,
    restaurantId,
    items,
    totalPrice,
  });

  const msg = {
    orderId: order?._id.toString(),
  };

  await publishToOrderTimeoutDelayQueue(msg);
};

const getOrderById = async (
  orderId: string,
  requesterId: string,
  requesterRole: string
) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new NotFoundError("Order not found");
  }

  const isCustomer = order.customerId.toString() === requesterId.toString();

  let isRestaurantOwner = false;
  if (requesterRole === "restaurant") {
    const restaurant = await Restaurant.findById(order.restaurantId);
    isRestaurantOwner = restaurant?.ownerId.toString() === requesterId;
  }

  if (!isCustomer && !isRestaurantOwner) {
    throw new UnauthorizedError("You are not allowed to view this order");
  }

  return order;
};

const getOrdersForCustomer = async (customerId: string) => {
  return Order.find({ customerId }).sort({ createdAt: -1 });
};

const getOrdersForRestaurant = async (
  restaurantId: string,
  requesterId: string
) => {
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    throw new NotFoundError("Restaurant not found");
  }
  if (restaurant.ownerId.toString() !== requesterId) {
    throw new UnauthorizedError(
      "Only the restaurant owner can view these orders"
    );
  }
  return Order.find({ restaurantId }).sort({ createdAt: -1 });
};

const updateOrderStatus = async (
  orderId: string,
  requesterId: string,
  newStatus: OrderStatus,
  requesterRole: string
) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new NotFoundError("Order not found");
  }

  const isCustomer = order.customerId.toString() === requesterId;
  let isRestaurantOwner = false;

  if (requesterRole === "restaurant") {
    const restaurant = await Restaurant.findById(order.restaurantId);
    isRestaurantOwner = restaurant?.ownerId.toString() === requesterId;
  }

  let actorState: ActorState;

  if (isCustomer) {
    actorState = "customer";
  } else if (isRestaurantOwner) {
    actorState = "restaurant";
  } else {
    actorState = null;
  }

  if (actorState === null) {
    throw new UnauthorizedError(
      "Only the customer and restaurant owner can update order status"
    );
  }

  const isTransitionAllowed = canTransition(order.status, newStatus); // if ("accepted", "preparing") it will return true but ("placed", "preparing") it will return false

  if (!isTransitionAllowed) {
    throw new ForbiddenError(
      `Cannot transition from ${order.status} to ${newStatus}`
    );
  }

  const allowedActor = TRANSITION_ACTORS[newStatus]; // who is allowed to change/initiate a specific state in case of preparing only restaurant is allowed

  if (actorState !== allowedActor) {
    throw new ForbiddenError(
      `Only the ${actorState} can mark an order as ${newStatus}`
    );
  }

  switch (newStatus) {
    case "accepted":
      order.acceptedAt = new Date();
      break;
    case "preparing":
      order.preparingAt = new Date();
      break;
    case "out_for_delivery":
      order.outForDeliveryAt = new Date();
      break;
    case "delivered":
      order.deliveredAt = new Date();
      break;
    case "cancelled_by_customer":
    case "cancelled_by_restaurant":
      order.cancelledAt = new Date();
      break;
    default:
      break;
  }

  order.status = newStatus;
  await order.save();
  return order;
};

const autoRejectOrder = async (orderId: string) => {
  const order = await Order.findById(orderId);

  if (order?.status !== "placed") {
    return;
  }

  if (!canTransition(order.status, "timed_out")) {
    return;
  }

  order.status = "timed_out";
  order.timedOutAt = new Date();
  order.save();
};

export const orderService = {
  createOrder,
  getOrderById,
  getOrdersForCustomer,
  getOrdersForRestaurant,
  updateOrderStatus,
  autoRejectOrder,
};
