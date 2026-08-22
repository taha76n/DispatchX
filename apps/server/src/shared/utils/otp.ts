import crypto from "node:crypto";
import { redisClient } from "../../configs/redis.js";
import { BadRequestError } from "./error.js";

export const generateVerificationToken = async (email: string) => {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenKey = `verify-token:${token}`;

  await redisClient.set(tokenKey, email, { EX: 300 });
  const verificationUrl = `http://localhost:5173/verify-email/${token}`;
  return verificationUrl;
};

export const verifyVerificationToken = async (token: string) => {
  const tokenKey = `verify-token:${token}`;
  const isTokenInRedis = await redisClient.get(tokenKey);

  if (!isTokenInRedis) {
    throw new BadRequestError("Verification link is expired or invalid");
  }

  await redisClient.del(tokenKey);

  return isTokenInRedis;
};
