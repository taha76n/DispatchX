import { Role } from "@dispatchx/shared";
import jwt from "jsonwebtoken";
import { config } from "../../configs/index.js";
import { UnauthorizedError } from "../utils/error.js";
import { logger } from "../utils/logger.js";
import { ExtendedError, Socket } from "socket.io";

export const socketAuthMiddleware = (
  socket: Socket,
  next: (err?: ExtendedError) => void
) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie;

    if (!cookieHeader) {
      throw new UnauthorizedError("Authentication token missing. Please login.");
    }
    
    // const cookies = cookie.parse(cookieHeader);
    // const accessToken = cookies.accessToken;

    const accessToken = cookieHeader
      .split(';')
      .map(cookie => cookie.trim())
      .find(cookie => cookie.startsWith('accessToken='))
      ?.split('=')[1];

    if (!accessToken) {
      throw new UnauthorizedError(
        "Authentication token missing. Please login."
      );
    }

    const decodedPayload = jwt.verify(accessToken, config.JWT_ACCESS_SECRET) as {
      _id: string;
      role: Role;
    };

    if (
      typeof decodedPayload !== "object" ||
      !decodedPayload._id ||
      !decodedPayload.role
    ) {
      throw new UnauthorizedError("Invalid token payload");
    }

    socket.data.user = decodedPayload;
    next();
  } catch (error) {
    logger.error("Socket auth failed: ", error);
    next(new Error("You are unauthorized"));
  }
};
