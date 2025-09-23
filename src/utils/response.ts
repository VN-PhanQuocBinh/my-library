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

import type { Response } from "express";

interface SuccessResponse {
  success: true;
  status: number;
  message: string;
  data: any;
  timestamp: string;
}

export interface ErrorResponse {
  success: false;
  status: number;
  message: string;
  data: null;
  timestamp: string;
  error?: {
    code: string;
    details: string;
  };
}

interface SuccessArgs {
  res: Response;
  message: string;
  data: any;
  statusCode?: number;
}

interface ErrorArgs {
  res: Response;
  message: string;
  errorDetails: any;
  data?: any;
  statusCode?: number;
}

export const generateSuccessResponse = ({
  res,
  message,
  data,
  statusCode = 200,
}: SuccessArgs): Response<SuccessResponse> => {
  return res.status(statusCode).json({
    success: true,
    status: statusCode,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

export const generateErrorResponse = ({
  res,
  message,
  errorDetails,
  data = null,
  statusCode = 500,
}: ErrorArgs): Response<ErrorResponse> => {
  const response: ErrorResponse = {
    success: false,
    status: statusCode,
    message,
    data,
    timestamp: new Date().toISOString(),
  };

  if (errorDetails) {
    if (errorDetails.name === "ValidationError") {
      response.error = {
        code: "VALIDATION_ERROR",
        details: errorDetails.message,
      };
    } else {
      response.error = {
        code: "SERVER_ERROR",
        details: errorDetails.message,
      };
    }
  }

  return res.status(statusCode).json(response);
};

export { formatUserResponse, createSuccessResponse, createErrorResponse };
