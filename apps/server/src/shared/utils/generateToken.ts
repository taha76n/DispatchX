import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { config } from "../../configs/index.js";
import { Types } from "mongoose";

interface UserTokenPayload {
  _id: Types.ObjectId | string;
  role: string;
}

export const generateAccessToken = (user: UserTokenPayload) => {
  return jwt.sign(
    { _id: user._id, role: user.role },
    config.JWT_ACCESS_SECRET,
    {
      expiresIn: "1d",
    }
  );
};

export const generateRefreshToken = (user: UserTokenPayload) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    config.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

export const generateHashRefreshToken = (token: string) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const verifyRefreshToken = (refreshToken: string) => {
  return jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);
};
