import type { Gender } from "./common.ts";

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
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
}

export interface AuthResponse {
  access_token: string;
  user: UserResponse;
}
