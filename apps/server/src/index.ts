import app from "./app.js";
import { config } from "./configs/index.js";
import { connectDb } from "./configs/mongo.js";
import { connectRedis } from "./configs/redis.js";

await connectDb();
await connectRedis();

app.listen(config.PORT, () => {
  console.log(`Server running on http://localhost:${config.PORT}`);
});
