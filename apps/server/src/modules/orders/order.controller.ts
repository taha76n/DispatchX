import { Request, Response } from "express";
import { Types } from "mongoose";
import { orderService } from "./order.service.js";
import type { OrderStatus } from "./order.model.js";
import { RestaurantIdParams } from "../restaurants/restaurant.controller.js";

const ALLOWED_STATUSES: OrderStatus[] = [
  "placed",
  "accepted",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const createOrder = async (req: Request, res: Response) => {
  const customerId = req._id;
  const { restaurantId, items } = req.body;

  let userRole = req.role;

  if (userRole) {
    userRole = userRole.toLowerCase();
  }

  if (userRole !== "customer") {
    return res
      .status(403)
      .json({ success: false, message: "Only customers can place orders" });
  }

  if (!restaurantId || !Types.ObjectId.isValid(restaurantId)) {
    return res
      .status(400)
      .json({ success: false, message: "Valid restaurantId is required" });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "Items array is required" });
  }

  const order = await orderService.createOrder(customerId, restaurantId, items);
  return res
    .status(201)
    .json({ success: true, message: "Order placed successfully", order });
};

interface OrderIdParams {
  orderId: string;
}

const getOrderById = async (req: Request<OrderIdParams>, res: Response) => {
  const { orderId } = req.params;
  if (!orderId || !Types.ObjectId.isValid(orderId)) {
    return res
      .status(400)
      .json({ success: false, message: "Valid orderId is required" });
  }

  const order = await orderService.getOrderById(orderId, req._id!, req.role!);
  return res
    .status(200)
    .json({ success: true, message: "Order fetched successfully", order });
};

const getMyOrders = async (req: Request, res: Response) => {
  const orders = await orderService.getOrdersForCustomer(req._id!);
  return res
    .status(200)
    .json({ success: true, message: "Orders fetched successfully", orders });
};

const getRestaurantOrders = async (
  req: Request<RestaurantIdParams>,
  res: Response
) => {
  const { restaurantId } = req.params;
  if (!restaurantId || !Types.ObjectId.isValid(restaurantId)) {
    return res
      .status(400)
      .json({ success: false, message: "Valid restaurantId is required" });
  }

  const orders = await orderService.getOrdersForRestaurant(
    restaurantId,
    req._id!
  );
  return res
    .status(200)
    .json({
      success: true,
      message: "Restaurant orders fetched successfully",
      orders,
    });
};

const updateOrderStatus = async (
  req: Request<OrderIdParams>,
  res: Response
) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (!orderId || !Types.ObjectId.isValid(orderId)) {
    return res
      .status(400)
      .json({ success: false, message: "Valid orderId is required" });
  }
  if (!status || !ALLOWED_STATUSES.includes(status)) {
    return res
      .status(400)
      .json({ success: false, message: "Valid status is required" });
  }

  const order = await orderService.updateOrderStatus(orderId, req._id!, status);
  return res
    .status(200)
    .json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
};

const cancelOrder = async (req: Request<OrderIdParams>, res: Response) => {
  const { orderId } = req.params;
  if (!orderId || !Types.ObjectId.isValid(orderId)) {
    return res
      .status(400)
      .json({ success: false, message: "Valid orderId is required" });
  }

  const order = await orderService.cancelOrder(orderId, req._id!);
  return res
    .status(200)
    .json({ success: true, message: "Order cancelled successfully", order });
};

export const orderController = {
  createOrder,
  getOrderById,
  getMyOrders,
  getRestaurantOrders,
  updateOrderStatus,
  cancelOrder,
};
