import { connect, type Channel } from "amqplib";
import { config } from "./index.js";
import { logger } from "../shared/utils/logger.js";

// The single shared channel for this whole process. A "channel" is a
// lightweight virtual connection that rides on top of one real TCP
// connection to RabbitMQ — we only ever need one connection and one
// channel for a simple app like this; all publishing/consuming happens
// through this same channel.
export let channel: Channel;

/**
 * Called once, at server startup (from index.ts). Establishes the real
 * connection, opens the channel, and declares every exchange/queue this
 * app depends on.
 *
 * IMPORTANT: RabbitMQ queues remember their configuration (arguments)
 * permanently once created. If you ever change a queue's arguments here,
 * you must delete the existing queue (via the management UI at
 * localhost:15672, or channel.deleteQueue) before restarting — otherwise
 * you'll get a 406 PRECONDITION-FAILED error and the whole channel closes.
 */
export const connectRabbitmq = async () => {
  const connection = await connect(config.RABBITMQ_URL);
  channel = await connection.createChannel();

  // ─────────────────────────────────────────────────────────────
  // VERIFICATION EMAIL PIPELINE
  //
  // Flow: publishToQueue() -> verification-email-queue -> consumer
  // tries to send the email. On failure, the consumer nacks with
  // requeue:false, which RabbitMQ routes (via the queue's
  // x-dead-letter-* arguments below) into the "dlx" exchange, which
  // is bound to verification-email-dlq. Failed emails land there for
  // manual inspection instead of being retried forever or silently lost.
  // ─────────────────────────────────────────────────────────────

  // "dlx" = dead-letter exchange. "direct" = route by exact matching key.
  await channel.assertExchange("dlx", "direct", { durable: true });

  // The actual queue where failed verification emails come to rest.
  await channel.assertQueue("verification-email-dlq", { durable: true });

  // Connects the exchange to the queue: any message the exchange
  // receives with routing key "verification-email-failed" gets
  // delivered into verification-email-dlq.
  await channel.bindQueue(
    "verification-email-dlq",
    "dlx",
    "verification-email-failed"
  );

  // NOTE: verification-email-queue itself is asserted inside
  // sendVerificationMailConsumer() and publishToQueue() below — both
  // declarations must stay IDENTICAL (same arguments), since RabbitMQ
  // rejects any attempt to redeclare an existing queue with different
  // settings.

  // ─────────────────────────────────────────────────────────────
  // ORDER AUTO-TIMEOUT PIPELINE (the "DLX delay trick")
  //
  // RabbitMQ has no native "deliver this message N seconds from now"
  // feature. We fake it using TTL + dead-lettering:
  //
  //   1. A new order publishes a message to order-timeout-delay-queue.
  //   2. Nobody ever consumes from that queue directly. The message
  //      just sits there for x-message-ttl milliseconds.
  //   3. Once the TTL expires, RabbitMQ treats the message as "dead"
  //      (expired, not failed) and — because of this queue's
  //      x-dead-letter-* arguments — routes it into order-timeout-exchange.
  //   4. That exchange is bound to order-timeout-queue, which is where
  //      our REAL consumer lives, checking "is this order still placed?"
  // ─────────────────────────────────────────────────────────────

  await channel.assertExchange("order-timeout-exchange", "direct", {
    durable: true,
  });

  // The REAL destination queue — where the timeout check actually happens.
  // This queue is terminal: nothing should ever dead-letter out of it,
  // so it gets no x-dead-letter-* arguments at all.
  await channel.assertQueue("order-timeout-queue", { durable: true });

  await channel.bindQueue(
    "order-timeout-queue",
    "order-timeout-exchange",
    "order-timeout"
  );

  // The DELAY queue — messages published here are never consumed
  // directly. They wait out their TTL, then get automatically
  // dead-lettered into order-timeout-exchange (routing key
  // "order-timeout"), which the binding above delivers into
  // order-timeout-queue for real processing.
  //
  // 10000ms (10s) is a short value for local testing/demoing the flow.
  // Swap to the real delay (e.g. 600000 = 10 minutes) once confirmed working.
  await channel.assertQueue("order-timeout-delay-queue", {
    durable: true,
    arguments: {
      "x-dead-letter-exchange": "order-timeout-exchange",
      "x-dead-letter-routing-key": "order-timeout",
      "x-message-ttl": 60000,
    },
  });

  await channel.assertExchange("offer-timeout-exchange", "direct", {
    durable: true,
  });

  await channel.assertQueue("offer-timeout-queue", { durable: true });

  await channel.bindQueue(
    "offer-timeout-queue",
    "offer-timeout-exchange",
    "offer-timeout"
  );

  await channel.assertQueue("offer-timeout-delay-queue", {
    durable: true,
    arguments: {
      "x-dead-letter-exchange": "offer-timeout-exchange",
      "x-dead-letter-routing-key": "offer-timeout",
      "x-message-ttl": 20000,
    },
  });
  logger.info("RabbitMQ connected");

  // If the underlying TCP connection breaks (RabbitMQ restarts, network
  // drop, etc.), this fires. We only log for now — there's no automatic
  // reconnect logic yet, which means the app would need a manual restart
  // to recover. Worth building real reconnect-with-backoff later.
  connection.on("error", (error) => {
    logger.error("RabbitMQ connection error");
    logger.error(error);
  });

  connection.on("close", () => {
    logger.info("RabbitMQ connection closed");
  });
};
