import { OrderStatus } from "@dispatchx/shared";
import mongoose, { Schema, Types } from "mongoose";


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
  placedAt: Date;
  acceptedAt?: Date;
  preparingAt?: Date;
  outForDeliveryAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
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
        "cancelled_by_customer",
        "cancelled_by_restaurant",
      ],
      default: "placed",
    },
    placedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    acceptedAt: {
      type: Date,
    },
    preparingAt: {
      type: Date,
    },
    outForDeliveryAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

orderSchema.index({ customerId: 1 });
orderSchema.index({ restaurantId: 1 });

export const Order = mongoose.model<OrderDocument>("Order", orderSchema);
