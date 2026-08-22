import { createClient } from "redis";
import { config } from "./index.js";
import { logger } from "../shared/utils/logger.js";

export const redisClient = createClient({
  url: config.REDIS_URL,
});

redisClient.on("error", (err) => {
  logger.error("Redis client error", { error: err.message });
});

redisClient.on("connect", () => {
  logger.info("Redis connected");
});

export async function connectRedis() {
  await redisClient.connect();
}