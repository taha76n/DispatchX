import { Request } from "express";

export interface HealthStatus {
  status: "ok";
  timestamp: string;
}

export type Role = "customer" | "restaurant" | "rider";

export interface PublicUser {
  _id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthRequest extends Request {
  _id: string;
  role: Role | string;
}

export interface RestaurantDetails {
  _id: string;
  name: string;
  description: string;
  isOpen: boolean;
  keywords: string[];
}

export type OrderStatus =
  | "placed"
  | "accepted"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled_by_customer"
  | "cancelled_by_restaurant";

export interface OrderItem {
  menuItemId: string;
  itemName: string;
  itemPrice: number;
  quantity: number;
}

export interface PlacedOrder {
  status: "placed";
  customerId: string;
  restaurantId: string;
  items: OrderItem[];
  totalPrice: number;
  placedAt: Date;
}

export interface AcceptedOrder {
  status: "accepted";
  customerId: string;
  restaurantId: string;
  items: OrderItem[];
  totalPrice: number;
  placedAt: Date;
  acceptedAt: Date;
}

export interface PreparingOrder {
  status: "preparing";
  customerId: string;
  restaurantId: string;
  items: OrderItem[];
  totalPrice: number;
  placedAt: Date;
  acceptedAt: Date;
  preparingAt: Date;
}

export interface OutForDeliveryOrder {
  status: "out_for_delivery";
  customerId: string;
  restaurantId: string;
  items: OrderItem[];
  totalPrice: number;
  placedAt: Date;
  acceptedAt: Date;
  preparingAt: Date;
  outForDeliveryAt: Date;
}

export interface DeliveredOrder {
  status: "delivered";
  customerId: string;
  restaurantId: string;
  items: OrderItem[];
  totalPrice: number;
  placedAt: Date;
  acceptedAt: Date;
  preparingAt: Date;
  outForDeliveryAt: Date;
  deliveredAt: Date;
}

export interface CancelledByCustomerOrder {
  status: "cancelled_by_customer";
  customerId: string;
  restaurantId: string;
  items: OrderItem[];
  totalPrice: number;
  placedAt: Date;
  cancelledAt: Date;
}

export interface CancelledByRestaurantOrder {
  status: "cancelled_by_restaurant";
  customerId: string;
  restaurantId: string;
  items: OrderItem[];
  totalPrice: number;
  placedAt: Date;
  acceptedAt: Date;
  cancelledAt: Date;
}

// The "union": an Order is one of these
export type Order =
  | PlacedOrder
  | AcceptedOrder
  | PreparingOrder
  | OutForDeliveryOrder
  | DeliveredOrder
  | CancelledByCustomerOrder
  | CancelledByRestaurantOrder;

export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  placed: ["accepted", "cancelled_by_customer", "cancelled_by_restaurant"],
  accepted: ["preparing", "cancelled_by_restaurant"],
  preparing: ["out_for_delivery"],
  out_for_delivery: ["delivered"],
  delivered: [],
  cancelled_by_customer: [],
  cancelled_by_restaurant: [],
};

export const canTransition = (from: OrderStatus, to: OrderStatus): boolean => {
  return ORDER_TRANSITIONS[from].includes(to);
};

export const TRANSITION_ACTORS: Record<OrderStatus, "customer" | "restaurant" | null> = {
  "placed": null,
  "accepted": "restaurant",
  "preparing": "restaurant",
  "out_for_delivery": "restaurant",
  "delivered": "restaurant",
  "cancelled_by_customer": "customer",
  "cancelled_by_restaurant": "restaurant"

}

export type ActorState = "customer" | "restaurant" | null
