import mongoose, { model, Schema } from "mongoose";

interface RiderDocument {
  userId: mongoose.Types.ObjectId;
  isOnline: boolean;
  ordersCompleted: number;
  vehicleInfo: {
    numberPlate: string;
    vehicleType: "Car" | "Motorbike";
    vehicleModelName: string;
  };
}

const riderSchema = new Schema<RiderDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    ordersCompleted: {
      type: Number,
      default: 0,
    },
    vehicleInfo: {
      numberPlate: { type: String, required: true },
      vehicleType: { type: String, enum: ["Car", "Motorbike"], required: true },
      vehicleModelName: {
        type: String,
        required: true,
      },
    },
  },
  { timestamps: true }
);

export const Rider = model<RiderDocument>("Rider", riderSchema);
