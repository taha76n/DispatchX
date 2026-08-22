import { Order, type OrderStatus } from "./order.model.js";
import { MenuItem } from "../restaurants/menuItem.model.js";
import { Restaurant } from "../restaurants/restaurant.model.js";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../../shared/utils/error.js";
import { Types } from "mongoose";

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

  return Order.create({ customerId, restaurantId, items, totalPrice });
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
  newStatus: OrderStatus
) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new NotFoundError("Order not found");
  }

  const restaurant = await Restaurant.findById(order.restaurantId);
  if (!restaurant || restaurant.ownerId.toString() !== requesterId) {
    throw new UnauthorizedError(
      "Only the restaurant owner can update order status"
    );
  }

  order.status = newStatus;
  await order.save();
  return order;
};

const cancelOrder = async (orderId: string, requesterId: string) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new NotFoundError("Order not found");
  }
  if (order.customerId.toString() !== requesterId) {
    throw new UnauthorizedError(
      "Only the customer who placed this order can cancel it"
    );
  }
  if (order.status !== "placed") {
    throw new BadRequestError("Order can no longer be cancelled");
  }

  order.status = "cancelled";
  await order.save();
  return order;
};

export const orderService = {
  createOrder,
  getOrderById,
  getOrdersForCustomer,
  getOrdersForRestaurant,
  updateOrderStatus,
  cancelOrder,
};
