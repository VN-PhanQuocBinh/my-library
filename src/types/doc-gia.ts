import type { mongo, ObjectId } from "mongoose";
import mongoose from "mongoose";
import type { Types } from "mongoose";

export interface PenaltyRecord {
  amount?: number;
  reason: string;
  type: "late-return" | "lost-book" | "other";
  banUntilDate?: Date;
  borrowId?: Types.ObjectId;
  createdAt?: Date;
}

export interface IDocGia extends Document {
  firstname: string;
  lastname: string;
  normalizedFullname?: string;
  gender: "male" | "female" | "other";
  status?: "active" | "inactive" | "banned";
  dateOfBirth: Date;
  phoneNumber: string;
  email: string;
  passwordHash?: string;
  address: string;

  totalDebt: number;
  currentBanUntil?: Date;
  penaltyLog: PenaltyRecord[];

  // virtuals
  isBanned?: boolean;

  comparePassword(password: string): Promise<boolean>;
  __v?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IDocGiaWithId extends IDocGia {
  _id: string;
}
