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
  _id: string,
  name: string,
  description: string,
  isOpen: boolean,
  keywords: string[]
}
