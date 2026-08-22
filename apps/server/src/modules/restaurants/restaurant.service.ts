import { Types } from "mongoose";
import { NotFoundError, UnauthorizedError } from "../../shared/utils/error.js";
import { Restaurant } from "./restaurant.model.js";
import { logger } from "../../shared/utils/logger.js";

interface Address {
  text: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
}

interface OperatingHours {
  open: string;
  close: string;
}

const createRestaurant = async (
  userRole: "restaurant",
  ownerId: string,
  name: string,
  description: string,
  isOpen: boolean,
  keywords: string[],
  address: Address,
  operatingHours: OperatingHours
) => {
  const restaurant = await Restaurant.create({
    ownerId,
    name,
    description,
    isOpen,
    keywords,
    address,
    operatingHours,
  });

  return restaurant;
};

const getRestaurantById = async (restaurantId: Types.ObjectId | string) => {
  const restaurant = await Restaurant.findById(restaurantId);

  return restaurant;
};

const getAllRestaurants = async () => {
  const restaurants = await Restaurant.find();

  return restaurants;
};

const updateRestaurantDetails = async (
  userId: Types.ObjectId | string,
  restaurantId: Types.ObjectId | string,
  name: string,
  description: string,
  isOpen: boolean,
  keywords: string[],
  address: Address,
  operatingHours: OperatingHours
) => {
  const restaurant = await Restaurant.findById(restaurantId);

  if (!restaurant) {
    throw new NotFoundError("Restaurant not found");
  }

  logger.info(restaurant);

  if (userId.toString() !== restaurant.ownerId.toString()) {
    throw new UnauthorizedError(
      "Only the owner can update restaurant's information"
    );
  }
  logger.info(restaurant.ownerId.toString());

  const updateData = {
    name,
    description,
    isOpen,
    keywords,
    address,
    operatingHours,
  };

  const updatedRestaurant = await Restaurant.findByIdAndUpdate(
    restaurantId,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!updatedRestaurant) {
    throw new NotFoundError("Restaurant not found after update");
  }

  return updatedRestaurant;
};

const deleteRestaurantById = async (
  userId: Types.ObjectId | string,
  restaurantId: Types.ObjectId | string
) => {
  const restaurant = await Restaurant.findById(restaurantId);

  if (!restaurant) {
    throw new NotFoundError("Restaurant not found with restaurant id");
  }

  if (userId.toString() !== restaurant.ownerId.toString()) {
    throw new UnauthorizedError("Only restaurant owner can delete restaurant");
  }

  await Restaurant.findByIdAndDelete(restaurantId);
};

export const restaurantService = {
  createRestaurant,
  getRestaurantById,
  getAllRestaurants,
  updateRestaurantDetails,
  deleteRestaurantById,
};
