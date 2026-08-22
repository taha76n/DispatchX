import { Types } from "mongoose";
import { Restaurant } from "./restaurant.model.js";
import { NotFoundError, UnauthorizedError } from "../../shared/utils/error.js";
import { MenuItem } from "./menuItem.model.js";

const createMenuItem = async (
  userId: Types.ObjectId | string,
  restaurantId: Types.ObjectId | string,
  itemName: string,
  itemPrice: number,
  itemDescription: string,
  tags: string[],
  isAvailable: boolean
) => {
  const restaurant = await Restaurant.findById(restaurantId);

  if (!restaurant) {
    throw new NotFoundError("No restaurant find with this resturant id");
  }

  if (userId.toString() !== restaurant.ownerId.toString()) {
    throw new UnauthorizedError(
      "Only restaurant owner is allowed to create menu items"
    );
  }

  const menuItem = await MenuItem.create({
    restaurantId,
    itemName,
    itemPrice,
    itemDescription,
    tags,
    isAvailable,
  });

  return menuItem;
};

const getAllMenuItemsofRestaurant = async (
  restaurantId: Types.ObjectId | string
) => {
  const menuItems = await MenuItem.find({ restaurantId });

  return menuItems;
};

const updateMenuItem = async (
  userId: Types.ObjectId | string,
  restaurantId: Types.ObjectId | string,
  menuItemId: Types.ObjectId | string,
  itemName: string,
  itemPrice: number,
  itemDescription: string,
  tags: string[],
  isAvailable: boolean
) => {
  const restaurant = await Restaurant.findById(restaurantId);

  if (!restaurant) {
    throw new NotFoundError("No restaurant found with this resturant id");
  }

  if (userId.toString() !== restaurant.ownerId.toString()) {
    throw new UnauthorizedError(
      "Only restaurant owner is allowed to update menu items"
    );
  }

  const menuItem = await MenuItem.findById(menuItemId);

  if (!menuItem) {
    throw new NotFoundError("No menu item found with this resturant id");
  }

  if (menuItem.restaurantId.toString() !== restaurant._id.toString()) {
    throw new UnauthorizedError(
      "You can only update menu items of your own restaurant"
    );
  }

  const updateData = {
    itemName,
    itemPrice,
    itemDescription,
    tags,
    isAvailable,
  };

  const updatedMenuItem = await MenuItem.findByIdAndUpdate(
    menuItemId,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  return updatedMenuItem;
};

const deleteMenuItem = async (
  userId: Types.ObjectId | string,
  restaurantId: Types.ObjectId | string,
  menuItemId: Types.ObjectId | string
) => {
  const restaurant = await Restaurant.findById(restaurantId);

  if (!restaurant) {
    throw new NotFoundError("No restaurant found with this resturant id");
  }

  if (userId.toString() !== restaurant.ownerId.toString()) {
    throw new UnauthorizedError(
      "Only restaurant owner is allowed to delete menu items"
    );
  }

  const menuItem = await MenuItem.findById(menuItemId);

  if (!menuItem) {
    throw new NotFoundError("No menu item found with this resturant id");
  }

  if (menuItem.restaurantId.toString() !== restaurant._id.toString()) {
    throw new UnauthorizedError(
      "You can only delete menu items of your own restaurant"
    );
  }

  await MenuItem.findByIdAndDelete(menuItemId);
};

export const menuItemService = {
  createMenuItem,
  getAllMenuItemsofRestaurant,
  updateMenuItem,
  deleteMenuItem,
};
