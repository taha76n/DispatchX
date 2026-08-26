import express from "express";
import { authMiddleware } from "../../shared/middlewares/auth.middleware.js";
import { restaurantController} from "./restaurant.controller.js";
import { idempotencyMiddleware } from "../../shared/middlewares/idempotency.middleware.js";

const router = express.Router();

router.post("/create", authMiddleware, idempotencyMiddleware, restaurantController.createRestaurant);
router.post("/update", authMiddleware, idempotencyMiddleware, restaurantController.updateRestaurantDetails);
router.get("/all", restaurantController.getAllRestaurants);
router.get("/mine", authMiddleware, restaurantController.getMyRestaurants);
router.get("/:restaurantId", authMiddleware, restaurantController.getRestaurantById);
router.delete("/:restaurantId", authMiddleware, restaurantController.deleteRestaurantById);


export default router;
