import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger.js";
import { config } from "../../configs/index.js";
import jwt from "jsonwebtoken";
import { Role } from "@dispatchx/shared";

export const authMiddleware = (
  req: Request<any>,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    // 1. Check Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // 2. If no token in header, check accessToken cookie
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    // 3. If no token anywhere, reject
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing. Please login.",
      });
    }

    // 4. Verify token (same as before)
    const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET) as {
      _id: string;
      role: Role;
    };

    req._id = decoded._id;
    req.role = decoded.role;
    next();
  } catch (error) {
    logger.error(error);
    return res.status(401).json({
      success: false,
      message: "Invalid or Expired Token",
    });
  }
};
