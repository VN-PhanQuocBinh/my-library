import type { ObjectId } from "mongoose";

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
  comparePassword(password: string): Promise<boolean>;
  __v?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IDocGiaWithId extends IDocGia {
  _id: string;
}
