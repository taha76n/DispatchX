import express from "express";
import { riderController } from "./rider.controller.js";
import { authMiddleware } from "../../shared/middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create", authMiddleware, riderController.createRiderProfile);
router.get("/profile", authMiddleware, riderController.getRiderProfile);
router.get("/current-delivery", authMiddleware, riderController.getCurrentDelivery);
router.post("/location", authMiddleware, riderController.emitRiderLocation);
router.patch("/status", authMiddleware, riderController.updateRiderStatus);

export default router;
