import { channel } from "../../configs/rabbitmq.js";
import { logger } from "../../shared/utils/logger.js";
import { riderService } from "./rider.service.js";

export const startDispatchQueueConsumer = async () => {
  if (!channel) {
    throw new Error("Channel is missing");
  }

  const dispatchQueue = "dispatch-queue";

  await channel.assertQueue(dispatchQueue, { durable: true });

  logger.info(
    `startDispatchQueueConsumer started, ready to consume from ${dispatchQueue}`
  );

  channel.consume(dispatchQueue, async (msg) => {
    if (!msg) {
      return;
    }

    try {
      const { orderId } = JSON.parse(msg.content.toString());
      await riderService.tryNextCandidate(orderId)
      channel.ack(msg);
      logger.info(`Order ${orderId} dispatched.`);
    } catch (error) {
      logger.error("Failed to process order dispatch message");
      logger.error(error);
      channel.nack(msg, false, false);
    }
  });
};

export const publishToDispatchQueue = async (message: { orderId: string }) => {
  if (!channel) {
    logger.info("RabbitMq Channel is missing");
    return;
  }

  await channel.assertQueue("dispatch-queue", { durable: true });

  channel.sendToQueue("dispatch-queue", Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
};