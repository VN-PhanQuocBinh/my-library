import type { ObjectId } from "mongoose";
import type { Gender } from "../types/common.ts";
import type { IDocGia, IDocGiaWithId } from "../types/doc-gia.ts";
import type { UserResponse } from "../types/response.ts";

interface ResponseProps {
  message: string;
  data?: any;
  additionalData?: any;
  statusCode?: number;
}

const formatUserResponse = (user: IDocGiaWithId): UserResponse => {
  return {
    _id: user._id,
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    gender: user.gender,
    dateOfBirth: user.dateOfBirth,
    phoneNumber: user.phoneNumber,
    address: user.address,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const createSuccessResponse = ({
  message,
  data,
  statusCode = 200,
}: ResponseProps) => {
  return {
    status: "success",
    code: statusCode,
    message,
    data,
  };
};

const createErrorResponse = ({
  message,
  statusCode = 400,
  additionalData = {},
}: ResponseProps) => {
  return {
    status: "error",
    code: statusCode,
    message,
    ...additionalData,
  };
};

export { formatUserResponse, createSuccessResponse, createErrorResponse };
