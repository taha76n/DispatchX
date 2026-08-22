import mongoose, { Schema, model } from "mongoose";

interface RestaurantDocument {
  ownerId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  isOpen: boolean;
  keywords: string[];
  address: {
    text: string;
    location: {
      type: "Point";
      coordinates: [number, number]; // [longitude, latitude]
    };
  };
  operatingHours: {
    open: string; // e.g. "09:00"
    close: string; // e.g. "22:00"
  };
}

const restaurantSchema = new Schema<RestaurantDocument>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    keywords: [{ type: String, lowercase: true, trim: true }],
    address: {
      text: {
        type: String,
        required: true,
        trim: true,
      },
      location: {
        type: {
          type: String,
          enum: ["Point"],
          required: true,
        },
        coordinates: {
          type: [Number],
          required: true,
        },
      },
    },
    operatingHours: {
      open: {
        type: String,
        required: true,
      },
      close: {
        type: String,
        required: true,
      },
    },
  },
  { timestamps: true }
);

restaurantSchema.index({ "address.location": "2dsphere" });

export const Restaurant = model<RestaurantDocument>(
  "Restaurant",
  restaurantSchema
);
