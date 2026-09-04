import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import type { HealthStatus } from "@dispatchx/shared";
import { errorHandler } from "./shared/middlewares/errorHandler.middleware.js";
import { requestLogger } from "./shared/middlewares/reqLogger.middleware.js";
import authRoutes from "./modules/auth/auth.routes.js";
import restaurantRoutes from "./modules/restaurants/restaurant.routes.js";
import menuItemRoutes from "./modules/restaurants/menuItem.routes.js";
import orderRoutes from "./modules/orders/order.routes.js";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { logger } from "./shared/utils/logger.js";
import { socketAuthMiddleware } from "./shared/middlewares/socketAuth.middleware.js";
import { Restaurant } from "./modules/restaurants/restaurant.model.js";
import { Order } from "./modules/orders/order.model.js";
import { createAdapter } from "@socket.io/redis-adapter";
import { pubClient, subClient } from "./configs/redis.js";

const app = express();
export const server = createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.use(socketAuthMiddleware);

io.on("connection", (socket) => {
  logger.info(`User Connected: ${socket.id}`);

  socket.on("disconnect", () => {
    logger.info(`User Disconnected: ${socket.id}`);
  });

  socket.on("joinOrderRoom", async (orderId: string) => {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        logger.error(`No order is found with ${orderId}`);
        return;
      }
      const restaurant = await Restaurant.findById(order.restaurantId);
      if (!restaurant) {
        logger.error(`No restaurant is found with ${order.restaurantId}`);
        return;
      }
      const userId = socket.data.user._id;

      const isAllowed =
        order.customerId.toString() === userId ||
        restaurant.ownerId.toString() === userId;

      if (isAllowed) {
        socket.join(`order:${orderId}`);
      }
    } catch (error) {
      logger.error("Error joining order room:", error);
    }
  });
});

export const attachRedisAdapter = async () => {
  io.adapter(createAdapter(pubClient, subClient));
};

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use(cookieParser());

app.use(requestLogger);

app.get("/", (req, res) => {
  res.send("<h1>Hello from index.js of apps/server</h1>");
});

app.get("/health", (req, res) => {
  const status: HealthStatus = {
    status: "ok",
    timestamp: new Date().toISOString(),
  };
  res.json(status);
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/restaurant", restaurantRoutes);
app.use("/api/v1/menu", menuItemRoutes);
app.use("/api/v1/order", orderRoutes);

app.use(errorHandler);

export default app;
