import { BadRequestError, NotFoundError } from "../../shared/utils/error.js";
import { updateRiderLocation } from "../../shared/utils/riderLocation.js";
import { Rider } from "./rider.model.js";

interface VehicleInfoInterface {
  numberPlate: string;
  vehicleType: "Car" | "Motorbike";
  vehicleModelName: string;
}

const createRiderProfile = async (
  riderId: string,
  vehicleInfo: VehicleInfoInterface
) => {
  const doesRiderAlreadyExists = await Rider.findOne({ userId: riderId });

  if (doesRiderAlreadyExists) {
    throw new BadRequestError("Rider profile with this user id already exists");
  }

  const riderProfile = await Rider.create({
    userId: riderId,
    vehicleInfo: {
      numberPlate: vehicleInfo.numberPlate,
      vehicleType: vehicleInfo.vehicleType,
      vehicleModelName: vehicleInfo.vehicleModelName,
    },
  });

  return riderProfile;
};

const getRiderProfile = async (riderId: string) => {
  const rider = await Rider.findOne({ userId: riderId }).populate("userId", "name");

  const riderProfile = {
    vehicleType: rider?.vehicleInfo.vehicleType,
    numberPlate: rider?.vehicleInfo.numberPlate,
    vehicleModelName: rider?.vehicleInfo.vehicleModelName,
    isOnline: rider?.isOnline,
    ordersCompleted: rider?.ordersCompleted,
  };
  return riderProfile;
};

const emitRiderLocation = async (
  riderId: string,
  longitude: number,
  latitude: number
) => {
  const rider = await Rider.findOne({ userId: riderId });

  if (!rider) {
    throw new NotFoundError("Rider profile not found");
  }

  if (rider.isOnline !== true) {
    throw new NotFoundError("Rider should be online to emit location");
  }

  const newLocation = await updateRiderLocation(riderId, longitude, latitude);
  return newLocation;
};

const updateRiderStatus = async (riderId: string) => {
  const rider = await Rider.findOne({ userId: riderId });

  if (!rider) {
    throw new NotFoundError("Rider profile not found");
  }

  rider.isOnline = !rider.isOnline;
  await rider.save();

  return rider.isOnline;
};

export const riderService = {
  emitRiderLocation,
  updateRiderStatus,
  createRiderProfile,
  getRiderProfile
};
