import { channel } from "../../configs/rabbitmq.js";
import { logger } from "../../shared/utils/logger.js";
import { orderService } from "./order.service.js";

/**
 * Long-running consumer for order-timeout-queue — the REAL queue,
 * reached only after a message survives its wait in
 * order-timeout-delay-queue. Call once at startup.
 */
export const startOrderTimeoutQueueConsumer = async () => {
  if (!channel) {
    throw new Error("RabbitMq channel is missing");
  }

  try {
    const orderTimeoutQueue = "order-timeout-queue";

    // No dead-letter arguments here — this queue is the end of the
    // line for this pipeline, not a step that forwards elsewhere.
    await channel.assertQueue(orderTimeoutQueue, { durable: true });

    logger.info(
      `startOrderTimeoutQueueConsumer started, ready to consume from ${orderTimeoutQueue}`
    );

    channel.consume(orderTimeoutQueue, async (msg) => {
      if (!msg) return;

      try {
        const { orderId } = JSON.parse(msg.content.toString());

        // autoRejectOrder itself checks whether the order is still
        // "placed" before doing anything — if the restaurant already
        // accepted it in the meantime, this is a safe no-op.
        await orderService.autoRejectOrder(orderId);

        logger.info(`Timeout check completed for order ${orderId}`);
        channel.ack(msg);
      } catch (error) {
        logger.error("Failed to process order timeout message");
        logger.error(error);

        // No DLQ for this pipeline (kept simple, matching the
        // verification-email pipeline's "don't retry forever" choice).
        // requeue:false means a failed timeout-check message is dropped
        // rather than looping — acceptable for now since a missed
        // auto-reject just means the restaurant has to act manually;
        // it's not data loss in the way a lost email would feel.
        channel.nack(msg, false, false);
      }
    });
  } catch (error) {
    logger.error("Failed to start order timeout consumer");
    logger.error(error);
  }
};

/**
 * Publishes a message onto order-timeout-delay-queue. Call this right
 * after a new order is created (orderService.createOrder) — 10 seconds
 * (soon: ~10 minutes) later, the message dead-letters through to
 * order-timeout-queue, where startOrderTimeoutQueueConsumer checks
 * whether the restaurant ever responded.
 *
 * This function always targets the one specific delay queue — there's
 * no reason to parameterize the queue name here.
 */

interface OrderTimeoutMsg {
  orderId: string;
}

export const publishToOrderTimeoutDelayQueue = async (
  message: OrderTimeoutMsg
) => {
  if (!channel) {
    logger.info("RabbitMq Channel is missing");
    return;
  }

  // Must match the assertion in connectRabbitmq exactly.
  await channel.assertQueue("order-timeout-delay-queue", {
    durable: true,
    arguments: {
      "x-dead-letter-exchange": "order-timeout-exchange",
      "x-dead-letter-routing-key": "order-timeout",
      "x-message-ttl": 60000,
    },
  });

  channel.sendToQueue(
    "order-timeout-delay-queue",
    Buffer.from(JSON.stringify(message)),
    { persistent: true }
  );
};