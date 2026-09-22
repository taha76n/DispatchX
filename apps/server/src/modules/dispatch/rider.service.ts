import { canTransition, TERMINAL_ORDER_STATUSES } from "@dispatchx/shared";
import { io } from "../../app.js";
import { BadRequestError, NotFoundError } from "../../shared/utils/error.js";
import {
  findNearbyOnlineRiders,
  updateRiderLocation,
} from "../../shared/utils/riderLocation.js";
import { Order } from "../orders/order.model.js";
import { Restaurant } from "../restaurants/restaurant.model.js";
import { Rider } from "./rider.model.js";
import { publishToOfferTimeoutDelayQueue } from "./offerTimeout.consumer.js";
import { logger } from "../../shared/utils/logger.js";

interface VehicleInfoInterface {
  numberPlate: string;
  vehicleType: "Car" | "Motorbike";
  vehicleModelName: string;
}

const createRiderProfile = async (
  riderId: string,
  vehicleInfo: VehicleInfoInterface
) => {
  const doesRiderAlreadyExists = await Rider.findOne({ userId: riderId });

  if (doesRiderAlreadyExists) {
    throw new BadRequestError("Rider profile with this user id already exists");
  }

  const riderProfile = await Rider.create({
    userId: riderId,
    vehicleInfo: {
      numberPlate: vehicleInfo.numberPlate,
      vehicleType: vehicleInfo.vehicleType,
      vehicleModelName: vehicleInfo.vehicleModelName,
    },
  });

  return riderProfile;
};

const getRiderProfile = async (riderId: string) => {
  const rider = await Rider.findOne({ userId: riderId }).populate<{
    userId: { name: string };
  }>("userId", "name");

  if (!rider) {
    throw new NotFoundError("Rider profile not found");
  }

  const riderProfile = {
    name: rider.userId.name,
    vehicleType: rider.vehicleInfo.vehicleType,
    numberPlate: rider.vehicleInfo.numberPlate,
    vehicleModelName: rider.vehicleInfo.vehicleModelName,
    isOnline: rider.isOnline,
    ordersCompleted: rider.ordersCompleted,
  };

  return riderProfile;
};

const getCurrentDelivery = async (riderId: string) => {
  const order = await Order.findOne({
    riderId,
    status: { $nin: TERMINAL_ORDER_STATUSES },
  }).populate("restaurantId", "name address");

  if (!order) {
    // throw new NotFoundError("Order not found");
    return null;
  }

  return order;
};

const emitRiderLocation = async (
  riderId: string,
  longitude: number,
  latitude: number
) => {
  const rider = await Rider.findOne({ userId: riderId });

  if (!rider) {
    throw new NotFoundError("Rider profile not found");
  }

  if (rider.isOnline !== true) {
    throw new NotFoundError("Rider should be online to emit location");
  }

  const newLocation = await updateRiderLocation(riderId, longitude, latitude);

  const activeOrder = await Order.findOne({
    riderId,
    status: { $in: ["rider_assigned", "out_for_delivery"] },
  });

  logger.info(`activeOrder found: ${!!activeOrder}, orderId: ${activeOrder?._id}`);


  if (activeOrder) {
    io.to(`order:${activeOrder._id}`).emit("riderLocationUpdate", {
      orderId: activeOrder._id.toString(),
      longitude,
      latitude,
    });
  }

  return newLocation;
};

const updateRiderStatus = async (riderId: string) => {
  const rider = await Rider.findOne({ userId: riderId });

  if (!rider) {
    throw new NotFoundError("Rider profile not found");
  }

  rider.isOnline = !rider.isOnline;
  await rider.save();

  return rider.isOnline;
};

const findNextCandidate = async (orderId: string) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new NotFoundError("Order not Found");
  }

  const restaurantId = order?.restaurantId;

  const restaurant = await Restaurant.findById(restaurantId);

  if (!restaurant) {
    throw new NotFoundError("Restaurant not Found");
  }

  const longitude: number = restaurant.address.location.coordinates[0];

  const latitude: number = restaurant.address.location.coordinates[1];

  const riders = await findNearbyOnlineRiders(longitude, latitude, 5000);

  const remainingRiders = riders.filter((rider) => {
    const alreadyTried =
      order.triedRiderIds?.includes(rider.userId.toString()) ?? false;
    return !alreadyTried;
  });

  if (remainingRiders.length > 0) {
    return remainingRiders[0];
  } else {
    return null;
  }
};

const makeOffer = async (orderId: string, riderId: string) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  const restaurant = await Restaurant.findById(order.restaurantId);

  if (!restaurant) {
    throw new NotFoundError("Order not found");
  }

  const rider = await Rider.findOne({ userId: riderId });

  if (!rider) {
    throw new NotFoundError("Rider not found");
  }

  const room = `rider:${riderId}`;

  if (!order.triedRiderIds) {
    order.triedRiderIds = [];
  }

  order.triedRiderIds.push(riderId);
  await order.save();

  io.to(room).emit("deliveryOffer", {
    orderId: orderId,
    restaurantName: restaurant.name,
    restaurantAddress: restaurant.address,
    orderedItems: order.items,
    orderTotalPrice: order.totalPrice,
  });

  const message = {
    orderId: orderId,
    riderId: riderId,
  };

  await publishToOfferTimeoutDelayQueue(message);
};

const noRiderFoundTransition = async (orderId: string) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  if (order.status !== "preparing") {
    return;
  }

  if (!canTransition(order.status, "no_rider_found")) {
    return;
  }

  order.status = "no_rider_found";
  order.noRiderFoundAt = new Date();

  await order.save();

  const roomName = `order:${orderId}`;
  io.to(roomName).emit("orderStatusUpdated", {
    orderId: order._id,
    status: order.status,
    order,
  });
};

const tryNextCandidate = async (orderId: string) => {
  const rider = await riderService.findNextCandidate(orderId);
  if (!rider) {
    await riderService.noRiderFoundTransition(orderId);
    return;
  }

  await riderService.makeOffer(orderId, rider?.userId.toString());
};

export const riderService = {
  emitRiderLocation,
  updateRiderStatus,
  createRiderProfile,
  getRiderProfile,
  getCurrentDelivery,
  findNextCandidate,
  makeOffer,
  noRiderFoundTransition,
  tryNextCandidate,
};
