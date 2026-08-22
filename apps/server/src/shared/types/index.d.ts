import { Role } from "@dispatchx/shared";

declare global {
  namespace Express {
    interface Request {
      _id?: Types.ObjectId | string;
      role?: Role | string;
    }
  }
}

export {};
