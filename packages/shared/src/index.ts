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
  | "rider_assigned"
  | "out_for_delivery"
  | "delivered"
  | "cancelled_by_customer"
  | "cancelled_by_restaurant"
  | "timed_out"
  | "no_rider_found";

export const TERMINAL_ORDER_STATUSES: OrderStatus[] = [
  "delivered",
  "cancelled_by_customer",
  "cancelled_by_restaurant",
  "timed_out",
  "no_rider_found",
];

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

export interface RiderAssignedOrder {
  status: "rider_assigned";
  customerId: string;
  restaurantId: string;
  riderId: string;
  items: OrderItem[];
  totalPrice: number;
  placedAt: Date;
  acceptedAt: Date;
  preparingAt: Date;
  riderAssignedAt: Date;
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

export interface TimedOutOrder {
  status: "timed_out";
  customerId: string;
  restaurantId: string;
  items: OrderItem[];
  totalPrice: number;
  placedAt: Date;
  timedOutAt: Date;
}

export interface NoRiderFoundOrder {
  status: "no_rider_found";
  customerId: string;
  restaurantId: string;
  items: OrderItem[];
  totalPrice: number;
  placedAt: Date;
  acceptedAt: Date;
  preparingAt: Date;
  noRiderFoundAt: Date;
}

// The "union": an Order is one of these
export type Order =
  | PlacedOrder
  | AcceptedOrder
  | PreparingOrder
  | OutForDeliveryOrder
  | DeliveredOrder
  | CancelledByCustomerOrder
  | CancelledByRestaurantOrder
  | TimedOutOrder
  | NoRiderFoundOrder;

export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  placed: [
    "accepted",
    "cancelled_by_customer",
    "cancelled_by_restaurant",
    "timed_out",
  ],
  accepted: ["preparing", "cancelled_by_restaurant"],
  preparing: ["out_for_delivery", "no_rider_found", "rider_assigned"],
  rider_assigned: ["out_for_delivery"],
  out_for_delivery: ["delivered"],
  delivered: [],
  cancelled_by_customer: [],
  cancelled_by_restaurant: [],
  timed_out: [],
  no_rider_found: ["preparing"],
};

export const canTransition = (from: OrderStatus, to: OrderStatus): boolean => {
  return ORDER_TRANSITIONS[from].includes(to);
};

export const TRANSITION_ACTORS: Record<
  OrderStatus,
  "customer" | "restaurant" | "system" | "rider" | null
> = {
  placed: null,
  accepted: "restaurant",
  preparing: "restaurant",
  rider_assigned: "rider",
  out_for_delivery: "rider",
  delivered: "rider",
  cancelled_by_customer: "customer",
  cancelled_by_restaurant: "restaurant",
  timed_out: "system",
  no_rider_found: "system",
};

export const OFFER_MAX_ATTEMPTS = 5;

export type ActorState = "customer" | "restaurant" | "system" | "rider" | null;
