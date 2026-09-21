import { attachRedisAdapter, server } from "./app.js";
import { config } from "./configs/index.js";
import { connectDb } from "./configs/mongo.js";
import { connectRabbitmq } from "./configs/rabbitmq.js";
import { connectRedis } from "./configs/redis.js";
import { sendVerificationMailConsumer } from "./modules/auth/verificationemail.consumer.js";
import { startDispatchQueueConsumer } from "./modules/dispatch/dispatch.consumer.js";
import { startOfferTimeoutQueueConsumer } from "./modules/dispatch/offerTimeout.consumer.js";
import { startOrderTimeoutQueueConsumer } from "./modules/orders/orderTimeout.consumer.js";

await connectDb();
await connectRedis();
await connectRabbitmq();
await attachRedisAdapter();
await sendVerificationMailConsumer();
await startOrderTimeoutQueueConsumer();
await startDispatchQueueConsumer();
await startOfferTimeoutQueueConsumer();

server.listen(config.PORT, () => {
  console.log(`Server running on http://localhost:${config.PORT}`);
});
