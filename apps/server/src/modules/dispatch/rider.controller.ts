import { Request, Response } from "express";
import { riderService } from "./rider.service.js";
import { logger } from "../../shared/utils/logger.js";


const createRiderProfile = async (req: Request, res: Response) => {
  const riderId = req._id;
  const requesterRole = req.role;
  const { vehicleInfo } = req.body;

  if (
    !vehicleInfo.numberPlate ||
    !vehicleInfo.vehicleType ||
    !vehicleInfo.vehicleModelName
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid vehicle info format",
    });
  }

  if (!riderId || !requesterRole) {
    return res.status(400).json({
      success: false,
      message: "Rider id or user role is required",
    });
  }

  if (requesterRole !== "rider") {
    return res.status(400).json({
      success: false,
      message: "Requester role should be rider only",
    });
  }

  const riderProfile = await riderService.createRiderProfile(
    riderId,
    vehicleInfo
  );

  return res.status(201).json({
    success: true,
    message: "Rider profile created successfully",
    riderProfile: riderProfile,
  });
};

const getRiderProfile = async (req: Request, res: Response) => {
  const riderId = req._id;
  const requesterRole = req.role;

  if (!riderId || !requesterRole) {
    return res.status(400).json({
      success: false,
      message: "Rider id or user role is required",
    });
  }

  if (requesterRole !== "rider") {
    return res.status(400).json({
      success: false,
      message: "Requester role should be rider only",
    });
  }

  const riderProfile = await riderService.getRiderProfile(riderId);
  return res.status(200).json({
    success: true,
    message: "Rider profile fetched successfully",
    riderProfile: riderProfile,
  });
};

const emitRiderLocation = async (req: Request, res: Response) => {
  const riderId = req._id;
  const requesterRole = req.role;
  const { latitude, longitude } = req.body;

  if (!riderId) {
    return res.status(401).json({
      success: false,
      message: "You are unauthorized. Please login again",
    });
  }

  if (requesterRole !== "rider") {
    return res.status(403).json({
      success: false,
      message:
        "You are not authorized to perform this action. Only rider can update location",
    });
  }

  if (!latitude || !longitude) {
    return res.status(400).json({
      success: false,
      message: "latitude and longitude are required to update location",
    });
  }

  const parsedLongitude = parseFloat(longitude);
  const parsedLatitude = parseFloat(latitude);

  if (isNaN(parsedLongitude) || isNaN(parsedLatitude)) {
    return res.status(400).json({
      success: false,
      message: "latitude and longitude should be number",
    });
  }

  const newLocation = await riderService.emitRiderLocation(
    riderId,
    parsedLongitude,
    parsedLatitude
  );

  return res.status(200).json({
    success: true,
    message: "Rider location updated successfully",
    newLocation: newLocation,
  });
};

const updateRiderStatus = async (req: Request, res: Response) => {
  const riderId = req._id;
  logger.error("rider id", riderId);
  const requesterRole = req.role;

  if (!riderId) {
    return res.status(401).json({
      success: false,
      message: "You are unauthorized. Please login again",
    });
  }

  if (requesterRole !== "rider") {
    return res.status(403).json({
      success: false,
      message:
        "You are not authorized to perform this action. Only rider can update location",
    });
  }

  const newStatus = await riderService.updateRiderStatus(riderId);

  return res.status(200).json({
    success: true,
    message: "Rider status updated successfully",
    newStatus: newStatus,
  });
};

const getCurrentDelivery = async (req: Request, res: Response) => {
  const riderId = req._id;

 const order = await riderService.getCurrentDelivery(riderId)

  return res.status(200).json({
    success: true,
    message: "Current delivery fetched successfully",
    order,
  });
};

export const riderController = {
  createRiderProfile,
  emitRiderLocation,
  updateRiderStatus,
  getRiderProfile,
  getCurrentDelivery,
};
