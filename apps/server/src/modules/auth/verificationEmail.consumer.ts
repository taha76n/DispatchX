import { channel } from "../../configs/rabbitmq.js";
import { logger } from "../../shared/utils/logger.js";
import { sendMail } from "../../shared/utils/mailer.js";

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
