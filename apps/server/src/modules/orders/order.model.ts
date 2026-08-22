import mongoose, { Schema, Types } from "mongoose";

export type OrderStatus =
  | "placed"
  | "accepted"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

interface OrderItem {
  menuItemId: Types.ObjectId;
  itemName: string;
  itemPrice: number;
  quantity: number;
}

interface OrderDocument {
  customerId: Types.ObjectId;
  restaurantId: Types.ObjectId;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
}

const orderItemSchema = new Schema<OrderItem>(
  {
    menuItemId: {
      type: Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },
    itemName: { type: String, required: true },
    itemPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new Schema<OrderDocument>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items: OrderItem[]) => items.length > 0,
        message: "Order must contain at least one item",
      },
    },
    totalPrice: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: [
        "placed",
        "accepted",
        "preparing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "placed",
    },
  },
  { timestamps: true }
);

orderSchema.index({ customerId: 1 });
orderSchema.index({ restaurantId: 1 });

export const Order = mongoose.model<OrderDocument>("Order", orderSchema);
