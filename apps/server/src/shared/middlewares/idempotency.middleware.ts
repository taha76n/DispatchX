import { NextFunction, Request, Response } from "express";
import { redisClient } from "../../configs/redis.js";
import { logger } from "../utils/logger.js";

export const idempotencyMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let idempotencyKey: string | string[] | undefined =
    req.headers["idempotency-key"];

  logger.info(idempotencyKey)

  if (Array.isArray(idempotencyKey)) {
    idempotencyKey = idempotencyKey[0];
  }

  if (!idempotencyKey) {
    return next();
  }

  const redisKey = `idempotency:${idempotencyKey}`;

  const claimed = await redisClient.set(redisKey, "processing", {
    NX: true,
    EX: 600,
  });

  if (!claimed) {
    const stored = await redisClient.get(redisKey);

    if (stored === "processing") {
      return res.status(409).json({
        success: false,
        message: "A request with this idempotency key is already being processed",
      });
    }

    if (stored) {
      const cached = JSON.parse(stored);
      return res.status(cached.statusCode).json(cached.body);
    }

    // Key expired between our set and get (rare TTL race) — treat as a fresh request
    return next();
  }

  // We won the claim. Wrap res.json so that whatever the controller eventually
  // sends gets captured and stored, so a future duplicate can replay it.
  const originalJson = res.json.bind(res);

  res.json = (body: unknown) => {
    const record = JSON.stringify({ statusCode: res.statusCode, body });

    redisClient
      .set(redisKey, record, { EX: 600 })
      .catch((err) => {
        // Don't let a Redis write failure break the actual response —
        // worst case, the next duplicate request just isn't caught.
        console.error("Failed to store idempotency result:", err);
      });

    return originalJson(body);
  };

  next();
};