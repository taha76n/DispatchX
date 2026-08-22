import mongoose, { Document, Schema } from "mongoose";
import { Types } from "mongoose";

interface refreshTokenDocument extends Document {
  tokenHash: string;
  userId: Types.ObjectId | string;
  sessionId: string;
  isUsed: boolean;
  expiresAt: Date;
}

const refreshTokenSchema: Schema<refreshTokenDocument> = new mongoose.Schema(
  {
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

export const RefreshToken = mongoose.model<refreshTokenDocument>(
  "RefreshToken",
  refreshTokenSchema
);
