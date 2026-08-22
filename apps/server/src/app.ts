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

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

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
