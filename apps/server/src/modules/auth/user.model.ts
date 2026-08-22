import mongoose, { Document, Schema } from "mongoose";
import { Role } from "@dispatchx/shared";

interface UserDocument extends Document {
  name: string,
  email: string,
  hashedPassword: string,
  profilePicture?: {
    url: string,
    publicId: string
  },
  role: Role,
  isVerified?: boolean
}

const userSchema: Schema<UserDocument> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: true,
      trim: true
    },
    hashedPassword: {
      type: String,
      required: true,
    },
    profilePicture: {
      url: {
        type: String,
      },
      publicId: {
        type: String,
      },
    },
    role: {
      type: String,
      enum: ["customer", "restaurant", "rider"],
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

export const User= mongoose.model<UserDocument>("User", userSchema);
