import mongoose from "mongoose";
import { config } from "./index.js";

export const connectDb = async () => {
  if (!config.MONGO_URI) {
    throw new Error("MONGO_URI environment variable is missing");
  }

  try {
    await mongoose.connect(config.MONGO_URI);
    console.log("MongoDb Connected Successfully");
  } catch (error) {
    console.log(`MongoDb Connection Failed`, error);
    process.exit(1);
  }
};
