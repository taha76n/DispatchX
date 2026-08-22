import express from "express";
import { authMiddleware } from "../../shared/middlewares/auth.middleware.js";
import { orderController } from "./order.controller.js";
import { idempotencyMiddleware } from "../../shared/middlewares/idempotency.middleware.js";

const router = express.Router();

router.post("/create", authMiddleware, idempotencyMiddleware, orderController.createOrder);
router.get("/mine", authMiddleware, orderController.getMyOrders);
router.get("/restaurant/:restaurantId", authMiddleware, orderController.getRestaurantOrders);
router.get("/:orderId", authMiddleware, orderController.getOrderById);
router.patch("/:orderId/status", authMiddleware, orderController.updateOrderStatus);
router.patch("/:orderId/cancel", authMiddleware, orderController.cancelOrder);

export default router;