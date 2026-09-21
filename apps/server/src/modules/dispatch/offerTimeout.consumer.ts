import { OFFER_MAX_ATTEMPTS } from "@dispatchx/shared";
import { channel } from "../../configs/rabbitmq.js";
import { logger } from "../../shared/utils/logger.js";
import { Order } from "../orders/order.model.js";
import { riderService } from "./rider.service.js";

export const startOfferTimeoutQueueConsumer = async () => {
  if (!channel) {
    throw new Error("RabbitMq channel is missing");
  }

  const offerTimeoutQueue = "offer-timeout-queue";

  await channel.assertQueue(offerTimeoutQueue, { durable: true });

  logger.info(
    `startOfferTimeoutQueueConsumer started, ready to consume from ${offerTimeoutQueue}`
  );

  channel.consume(offerTimeoutQueue, async (msg) => {
    if (!msg) return;

    try {
      const { orderId } = JSON.parse(msg.content.toString());

      const order = await Order.findById(orderId);

      if (!order) {
        throw new Error("Order not found");
      }

      // Case A: order.riderId already set -> nothing to do
      if (order?.riderId) {
        return;
      }

      // Case B: still unset, but triedRiderIds.length >= MAX_ATTEMPTS -> give up
      if (!order?.triedRiderIds) {
        return;
      }

      if (order?.triedRiderIds.length >= OFFER_MAX_ATTEMPTS) {
        return;
      }

      // Case C: still unset, attempts remain -> await tryNextCandidate(orderId)
      await riderService.tryNextCandidate(orderId);

      channel.ack(msg);
    } catch (error) {
      logger.error("Failed to process offer timeout message");
      logger.error(error);
      channel.nack(msg, false, false);
    }
  });
};

interface OfferTimeoutMessage {
  orderId: string;
  riderId: string;
}

export const publishToOfferTimeoutDelayQueue = async (
  message: OfferTimeoutMessage
) => {
  if (!channel) {
    logger.info("RabbitMq Channel is missing");
    return;
  }

  await channel.assertQueue("offer-timeout-delay-queue", {
    durable: true,
    arguments: {
      "x-dead-letter-exchange": "offer-timeout-exchange",
      "x-dead-letter-routing-key": "offer-timeout",
      "x-message-ttl": 20000,
    },
  });

  channel.sendToQueue(
    "offer-timeout-delay-queue",
    Buffer.from(JSON.stringify(message)),
    { persistent: true }
  );
};




