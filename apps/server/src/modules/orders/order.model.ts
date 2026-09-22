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
  deliveryAddress: {
    text: string;
    location: {
      type: "Point";
      coordinates: [number, number]; // [longitude, latitude]
    };
  };
  triedRiderIds?: string[];
  riderId?: string;
  placedAt: Date;
  acceptedAt?: Date;
  riderAssignedAt?: Date;
  preparingAt?: Date;
  outForDeliveryAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  timedOutAt?: Date;
  noRiderFoundAt?: Date;
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
        "rider_assigned",
        "out_for_delivery",
        "delivered",
        "cancelled_by_customer",
        "cancelled_by_restaurant",
        "timed_out",
        "no_rider_found",
      ],
      default: "placed",
    },
    deliveryAddress: {
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

    triedRiderIds: {
      type: [String],
      default: [],
    },
    riderId: {
      type: String,
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
    timedOutAt: {
      type: Date,
    },
    noRiderFoundAt: {
      type: Date,
    },
    riderAssignedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

orderSchema.index({ customerId: 1 });
orderSchema.index({ restaurantId: 1 });

export const Order = mongoose.model<OrderDocument>("Order", orderSchema);
