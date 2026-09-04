import { createClient } from "redis";
import { config } from "./index.js";
import { logger } from "../shared/utils/logger.js";

export const redisClient = createClient({
  url: config.REDIS_URL,
});

redisClient.on("error", (err) => {
  logger.error(err.message, "Redis client error");
});

redisClient.on("connect", () => {
  logger.info("Redis connected");
});

export const pubClient = redisClient.duplicate();
export const subClient = redisClient.duplicate();

export async function connectRedis() {
  await redisClient.connect();
  await pubClient.connect();
  await subClient.connect();
}
