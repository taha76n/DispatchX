import { Request, Response } from "express";
import { restaurantService } from "./restaurant.service.js";
import { Types } from "mongoose";

const createRestaurant = async (req: Request, res: Response) => {
  let userRole = req.role;
  const ownerId = req._id;

  if (userRole) {
    userRole = userRole.toLowerCase();
  }

  const { name, description, isOpen, keywords, address, operatingHours } =
    req.body;

  if (
    !ownerId ||
    !name ||
    !description ||
    typeof isOpen !== "boolean" ||
    !keywords ||
    !address ||
    !operatingHours
  ) {
    return res.status(400).json({
      success: false,
      message:
        "ownerId, name, description, isOpen, keywords, address and operatingHours are required",
    });
  }

  if (
    !address.text ||
    !address.location?.type ||
    !Array.isArray(address.location?.coordinates) ||
    address.location.coordinates.length !== 2
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid address format" });
  }
  if (!operatingHours.open || !operatingHours.close) {
    return res
      .status(400)
      .json({ success: false, message: "Operating hours incomplete" });
  }

  if (!userRole) {
    return res.status(400).json({
      success: false,
      message: "User Role is required",
    });
  }

  if (userRole !== "restaurant") {
    return res.status(400).json({
      success: false,
      message: "User Role should be restaurant to create a restaurant",
    });
  }

  const restaurant = await restaurantService.createRestaurant(
    userRole,
    ownerId,
    name,
    description,
    isOpen,
    keywords,
    address,
    operatingHours
  );

  return res.status(201).json({
    success: true,
    message: "Restaurant Created Successfully",
    restaurant,
  });
};

export interface RestaurantIdParams {
  restaurantId: string;
}

const getRestaurantById = async (
  req: Request<RestaurantIdParams>,
  res: Response
) => {
  const restaurantId = req.params.restaurantId;

  if (!restaurantId) {
    return res
      .status(400)
      .json({ success: false, message: "Restaurant id is missing in params" });
  }

  if (!Types.ObjectId.isValid(restaurantId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid restaurant ID format",
    });
  }

  const restaurant = await restaurantService.getRestaurantById(restaurantId);

  return res.status(200).json({
    success: true,
    message: "Restaurant Fetched Successfully",
    restaurant,
  });
};

const getAllRestaurants = async (req: Request, res: Response) => {
  const restaurants = await restaurantService.getAllRestaurants();

  return res.status(200).json({
    success: true,
    message: "Restaurants Fetched Successfully",
    restaurants,
  });
};

const updateRestaurantDetails = async (req: Request, res: Response) => {
  const userId = req._id;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "userId is required",
    });
  }

  const {
    restaurantId,
    name,
    description,
    isOpen,
    keywords,
    address,
    operatingHours,
  } = req.body;

  if (
    !restaurantId ||
    !name ||
    !description ||
    typeof isOpen !== "boolean" ||
    !Array.isArray(keywords) ||
    !address ||
    !operatingHours
  ) {
    return res.status(400).json({
      success: false,
      message:
        "restaurantId, name, description, isOpen, keywords, address and operatingHours are required",
    });
  }

  if (
    !address.text ||
    !address.location?.type ||
    !Array.isArray(address.location?.coordinates) ||
    address.location.coordinates.length !== 2
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid address format" });
  }
  if (!operatingHours.open || !operatingHours.close) {
    return res
      .status(400)
      .json({ success: false, message: "Operating hours incomplete" });
  }

  const updatedRestaurant = await restaurantService.updateRestaurantDetails(
    userId,
    restaurantId,
    name,
    description,
    isOpen,
    keywords,
    address,
    operatingHours
  );

  return res.status(201).json({
    success: true,
    message: "Restaurant Updated Successfully",
    updatedRestaurant,
  });
};

const deleteRestaurantById = async (
  req: Request<RestaurantIdParams>,
  res: Response
) => {
  const userId = req._id;
  const restaurantId = req.params.restaurantId;

  if (!restaurantId) {
    return res
      .status(400)
      .json({ success: false, message: "Restaurant id is required" });
  }

  if (!Types.ObjectId.isValid(restaurantId)) {
    return res
      .status(400)
      .json({ success: false, message: "Restaurant type should be ObjectId" });
  }

  await restaurantService.deleteRestaurantById(userId, restaurantId);

  return res
    .status(200)
    .json({ success: true, message: "Restaurant deleted succesfully" });
};

const getMyRestaurants = async (req: Request, res: Response) => {
  const userId = req._id;
  const requesterRole = req.role

  if (requesterRole !== "restaurant") {
    return res
      .status(403)
      .json({
        success: false,
        message: "You should be a restaurant owner to perform this action",
      });
  }
  if (!userId) {
    return res
      .status(401)
      .json({
        success: false,
        message: "You should be login to perform this action",
      });
  }

  const restaurants = await restaurantService.getMyRestaurants(userId)

  return res.status(200).json({success: true, message: "Restaurants fetched successfully", restaurants})
};

export const restaurantController = {
  createRestaurant,
  getRestaurantById,
  getAllRestaurants,
  updateRestaurantDetails,
  deleteRestaurantById,
  getMyRestaurants
};
