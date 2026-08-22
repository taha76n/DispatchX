import express from "express";
import { authController } from "./auth.controller.js";
import { authMiddleware } from "../../shared/middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", authController.Register);
router.get("/verify-email/:token", authController.Verify);
router.post("/login", authController.Login);
router.get("/profile", authMiddleware, authController.userProfile);
router.post("/refresh", authController.rotateRefreshToken);
router.post("/logout", authController.Logout);

export default router;
