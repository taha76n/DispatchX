import { connect, type Channel } from "amqplib";
import { config } from "./index.js";
import { logger } from "../shared/utils/logger.js";
import { sendMail } from "../shared/utils/mailer.js";
import { orderService } from "../modules/orders/order.service.js";

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
      "x-message-ttl": 10000,
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

/**
 * Long-running consumer for verification-email-queue. Call once at
 * startup, right after connectRabbitmq(). Stays active for the life of
 * the process, picking up messages as they arrive.
 */
export const sendVerificationMailConsumer = async () => {
  if (!channel) {
    throw new Error("RabbitMq channel is missing");
  }

  try {
    const verificationEmailQueue = "verification-email-queue";

    // Must exactly match the arguments used anywhere else this same
    // queue name is asserted (see publishToQueue below) — a mismatch
    // here causes a 406 error that closes the whole channel.
    await channel.assertQueue(verificationEmailQueue, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": "dlx",
        "x-dead-letter-routing-key": "verification-email-failed",
      },
    });

    logger.info(
      `sendVerificationMailConsumer started, ready to consume from ${verificationEmailQueue}`
    );

    channel.consume(verificationEmailQueue, async (msg) => {
      if (!msg) return; // null means the consumer was cancelled server-side; nothing to do

      try {
        const { to, subject, text, html } = JSON.parse(msg.content.toString());
        await sendMail(to, subject, text, html);
        logger.info(`Verification email sent to ${to}`);

        // Tell RabbitMQ we successfully processed this message — it's
        // now safe to permanently remove it from the queue.
        channel.ack(msg);
      } catch (error) {
        logger.error("Failed to send verification email");
        logger.error(error);

        // requeue:false — don't retry, send straight to the DLQ via
        // this queue's x-dead-letter-* arguments. We deliberately chose
        // "no retry" for this pipeline: a bad email address won't fix
        // itself on a second attempt, so we just park it for inspection.
        channel.nack(msg, false, false);
      }
    });
  } catch (error) {
    logger.error("Failed to start verification email consumer");
    logger.error(error);
  }
};

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

interface EmailMsg {
  to: string;
  subject: string;
  text: string;
  html: string;
}

/**
 * Publishes an email job onto verification-email-queue. Call this from
 * anywhere that needs to send an email asynchronously (currently: the
 * register flow).
 */
export const publishToQueue = async (queueName: string, message: EmailMsg) => {
  if (!channel) {
    logger.info("RabbitMq Channel is missing");
    return;
  }

  // Must match sendVerificationMailConsumer's assertQueue exactly —
  // see the comment there for why.
  await channel.assertQueue(queueName, {
    durable: true,
    arguments: {
      "x-dead-letter-exchange": "dlx",
      "x-dead-letter-routing-key": "verification-email-failed",
    },
  });

  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
    persistent: true, // survive a RabbitMQ restart while still queued
  });
};

interface OrderTimeoutMsg {
  orderId: string;
}

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
export const publishToOrderTimeoutDelayQueue = async (message: OrderTimeoutMsg) => {
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
      "x-message-ttl": 10000,
    },
  });

  channel.sendToQueue(
    "order-timeout-delay-queue",
    Buffer.from(JSON.stringify(message)),
    { persistent: true }
  );
};