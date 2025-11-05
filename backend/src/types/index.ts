import { Request } from "express";

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password: string;
}

export interface IEvent {
  _id?: string;
  userId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  status: "BUSY" | "SWAPPABLE" | "SWAP_PENDING";
  createdAt?: Date;
}

export interface ISwapRequest {
  _id?: string;
  requesterId: string;
  requesterSlotId: string;
  targetUserId: string;
  targetSlotId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt?: Date;
}

export interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}
