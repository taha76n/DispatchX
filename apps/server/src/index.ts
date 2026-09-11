import { attachRedisAdapter, server } from "./app.js";
import { config } from "./configs/index.js";
import { connectDb } from "./configs/mongo.js";
import {
  connectRabbitmq,
  sendVerificationMailConsumer,
  startOrderTimeoutQueueConsumer,
} from "./configs/rabbitmq.js";
import { connectRedis } from "./configs/redis.js";

await connectDb();
await connectRedis();
await connectRabbitmq();
await attachRedisAdapter();
await sendVerificationMailConsumer();
await startOrderTimeoutQueueConsumer();


server.listen(config.PORT, () => {
  console.log(`Server running on http://localhost:${config.PORT}`);
});
