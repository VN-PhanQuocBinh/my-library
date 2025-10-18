import type { Gender } from "./common.ts";
import type { PenaltyRecord } from "../types/doc-gia.ts";

export interface SuccessResponse<T = any> {
  status: "success";
  message: string;
  data: T;
}

export interface ErrorResponse {
  status: "error";
  message: string;
  statusCode?: number;
  additionalData?: any;
}

export interface UserResponse {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  gender: Gender;
  dateOfBirth: Date;
  phoneNumber: string;
  address: string;

  totalDebt: number;
  currentBanUntil?: Date | undefined;
  penaltyLog: PenaltyRecord[];

  // virtuals
  isBanned?: boolean;

  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
}

export interface AuthResponse {
  access_token: string;
  user: UserResponse;
}
