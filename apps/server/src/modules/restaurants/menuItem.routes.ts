import express from "express";
import { authMiddleware } from "../../shared/middlewares/auth.middleware.js";
import { menuItemController } from "./menuItem.controller.js";
import { idempotencyMiddleware } from "../../shared/middlewares/idempotency.middleware.js";

const router = express.Router();

router.post("/create", authMiddleware, idempotencyMiddleware, menuItemController.createMenuItem);
router.post("/update", authMiddleware, menuItemController.updateMenuItem);
router.get(
  "/:restaurantId",
  authMiddleware,
  menuItemController.getAllMenuItemsofRestaurant
);
router.delete(
  "/:menuItemId",
  authMiddleware,
  menuItemController.deleteMenuItem
);

export default router;
