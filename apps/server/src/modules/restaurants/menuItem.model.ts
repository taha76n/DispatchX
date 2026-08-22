import mongoose, { Schema, model } from "mongoose";

interface MenuItemDocument {
  restaurantId: mongoose.Types.ObjectId;
  itemName: string;
  itemPrice: number;
  itemDescription: string;
  image?: {
    url: string;
    publicId: string;
  };
  tags: string[];
  isAvailable: boolean;
}

const menuItemSchema = new Schema<MenuItemDocument>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    itemName: {
      type: String,
      required: true,
      trim: true,
    },
    itemPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    itemDescription: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      url: { type: String },
      publicId: { type: String },
    },
    tags: [{ type: String, lowercase: true, trim: true }],
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

menuItemSchema.index({ restaurantId: 1 });

export const MenuItem = model<MenuItemDocument>("MenuItem", menuItemSchema);
