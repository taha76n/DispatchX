import { Request, Response } from "express";
import { Types } from "mongoose";
import { menuItemService } from "./menuItem.service.js";
import { logger } from "../../shared/utils/logger.js";

const createMenuItem = async (req: Request, res: Response) => {
  const userId = req._id;

  if (!userId) {
    return res
      .status(400)
      .json({ success: false, message: "User id is required" });
  }

  if (!Types.ObjectId.isValid(userId)) {
    return res
      .status(400)
      .json({ success: false, message: "User id should be of type ObjectId" });
  }

  const {
    restaurantId,
    itemName,
    itemPrice,
    itemDescription,
    tags,
    isAvailable,
  } = req.body;

  if (
    !restaurantId ||
    !itemName ||
    itemPrice === null ||
    itemPrice === undefined ||
    typeof itemPrice !== "number" ||   
    Number.isNaN(itemPrice) ||         
    itemPrice < 0 ||   
    !itemDescription ||
    !Array.isArray(tags) ||
    typeof isAvailable !== "boolean"
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  if (!Types.ObjectId.isValid(restaurantId)) {
    return res.status(400).json({
      success: false,
      message: "Restaurant id should be of type ObjectId",
    });
  }

  const menuItem = await menuItemService.createMenuItem(
    userId,
    restaurantId,
    itemName,
    itemPrice,
    itemDescription,
    tags,
    isAvailable
  );

  return res.status(201).json({
    success: true,
    message: "Menu Item created successfully",
    menuItem,
  });
};

const getAllMenuItemsofRestaurant = async (req: Request, res: Response) => {
  const userId = req._id;

  if (!userId) {
    return res
      .status(400)
      .json({ success: false, message: "User id is missing" });
  }

  const restaurantId = req.params.restaurantId;

  const id = Array.isArray(restaurantId) ? restaurantId[0] : restaurantId;

  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Restaurant id is required" });
  }

  if (!Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Restaurant id should be of type ObjectId",
    });
  }

  const menuItems = await menuItemService.getAllMenuItemsofRestaurant(id);

  return res.status(200).json({
    success: true,
    message: "Restaurant menu items fetched successfully",
    menuItems,
  });
};

const updateMenuItem = async (req: Request, res: Response) => {
  const userId = req._id;

  if (!userId) {
    return res
      .status(400)
      .json({ success: false, message: "User id is required" });
  }

  if (!Types.ObjectId.isValid(userId)) {
    return res
      .status(400)
      .json({ success: false, message: "User id should be of type ObjectId" });
  }

  const {
    restaurantId,
    menuItemId,
    itemName,
    itemPrice,
    itemDescription,
    tags,
    isAvailable,
  } = req.body;

  if (
    !restaurantId ||
    !menuItemId ||
    !itemName ||
    itemPrice === null ||
    itemPrice === undefined ||
    typeof itemPrice !== "number" ||   
    Number.isNaN(itemPrice) ||         
    itemPrice < 0 ||
    !itemDescription ||
    !Array.isArray(tags) ||
    typeof isAvailable !== "boolean"
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  if (!Types.ObjectId.isValid(restaurantId)) {
    return res.status(400).json({
      success: false,
      message: "Restaurant id should be of type ObjectId",
    });
  }

  if (!Types.ObjectId.isValid(menuItemId)) {
    return res.status(400).json({
      success: false,
      message: "MenuItem id should be of type ObjectId",
    });
  }

  const updatedMenuItem = await menuItemService.updateMenuItem(
    userId,
    restaurantId,
    menuItemId,
    itemName,
    itemPrice,
    itemDescription,
    tags,
    isAvailable
  );

  return res.status(201).json({
    success: true,
    message: "Menu Item updated successfully",
    updatedMenuItem,
  });
};
interface MenuItemId {
  menuItemId: string;
}
const deleteMenuItem = async (req: Request<MenuItemId>, res: Response) => {
  const menuItemId = req.params.menuItemId;
  const { restaurantId } = req.body;
  const userId = req._id;

  logger.info(restaurantId);
  logger.info(menuItemId);

  if (!menuItemId) {
    return res.status(400).json({
      success: false,
      message: "Menu item id is required",
    });
  }

  if (!Types.ObjectId.isValid(menuItemId)) {
    return res.status(400).json({
      success: false,
      message: "Menu item id should be of type ObjectId",
    });
  }

  if (!Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      success: false,
      message: "User id should be of type ObjectId",
    });
  }

  await menuItemService.deleteMenuItem(userId, restaurantId, menuItemId);

  return res.status(200).json({
    success: true,
    message: "Menu item deleted successfully",
  });
};

export const menuItemController = {
  createMenuItem,
  getAllMenuItemsofRestaurant,
  updateMenuItem,
  deleteMenuItem,
};
