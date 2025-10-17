import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import DocGia from "../models/DocGia.ts";
import type { IDocGiaWithId } from "../types/doc-gia.ts";
import { Error } from "mongoose";
import { JWT_SECRET, JWT_EXPIRES } from "../config/env.ts";

import {
  formatUserResponse,
  createSuccessResponse,
  createErrorResponse,
} from "../utils/response.ts";

import type {
  ReaderJWTPayload,
  LoginRequest,
  ReaderRegisterRequest,
} from "../types/request.ts";
import { format } from "path";
import { create } from "domain";

interface MongooseValidationError extends Error {
  name: "ValidationError";
  errors: Record<
    string,
    {
      message: string;
      value: any;
      kind: string;
    }
  >;
}

const signUser = (user: IDocGiaWithId): string => {
  const payload: ReaderJWTPayload = {
    sub: user._id.toString(),
    email: user.email,
    firstname: user.firstname,
    lastname: user.lastname,
  };
  console.log(JWT_EXPIRES, JWT_SECRET);

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1 day" });
};

class UserAuthController {
  async login(req: LoginRequest, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const user = await DocGia.findOne({ email }).select("+passwordHash");

      if (user?.isBanned) {
        const code = 403;
        return res.status(code).json(
          createErrorResponse({
            message: `Tài khoản của bạn bị cấm cho đến ${
              user.currentBanUntil
                ? new Date(user.currentBanUntil).toLocaleDateString()
                : "một ngày không xác định"
            }`,
            statusCode: code,
          })
        );
      }

      if (!user) {
        const code = 400;
        return res.status(code).json(
          createErrorResponse({
            message: "Fail to login",
            statusCode: code,
          })
        );
      }

      const ok = await user.comparePassword(password);
      if (!ok) {
        const code = 401;
        return res.status(code).json(
          createErrorResponse({
            message: "Fail to login",
            statusCode: code,
          })
        );
      }

      const token = signUser(user as any);
      const userResponse = formatUserResponse(user as any);

      return res.json(
        createSuccessResponse({
          message: "Login successfully",
          data: {
            accessToken: token,
            user: userResponse,
          },
        })
      );
    } catch (error) {
      next(error);
      return res.json(
        createErrorResponse({
          message: "Fail to login. Something went wrong.",
        })
      );
    }
  }

  async register(
    req: ReaderRegisterRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { password, ...payload } = req.body;

      // Check email exists
      const isExist = await DocGia.findOne({
        $or: [{ email: payload.email }, { phoneNumber: payload.phoneNumber }],
      });

      if (isExist) {
        const conflictField =
          isExist.email === payload.email ? "Email" : "Phone number";

        const additionalData = {};
        if (conflictField === "Email") {
          (additionalData as any).conflictValue = payload.email;
        } else {
          (additionalData as any).conflictValue = payload.phoneNumber;
        }

        return res.status(400).json(
          createErrorResponse({
            message: `${conflictField} already exists`,
            statusCode: 400,
            additionalData,
          })
        );
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await DocGia.create({ ...payload, passwordHash });
      const token = signUser(user as any);

      const userResponse = formatUserResponse(user as any);

      return res.status(201).json(
        createSuccessResponse({
          message: "Register successfully",
          data: {
            access_token: token,
            user: userResponse,
          },
        })
      );
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "name" in error &&
        error.name === "ValidationError"
      ) {
        const validationError = error as MongooseValidationError;
        const validationErrors: Record<string, any> = {};
        const errorMessages: string[] = [];

        Object.keys(validationError.errors).forEach((key) => {
          const errorInfo = validationError.errors[key];
          validationErrors[key] = {
            message: errorInfo?.message,
            value: errorInfo?.value,
            kind: errorInfo?.kind,
          };

          errorMessages.push(`${key}: ${errorInfo?.message}`);
        });
        return res.status(400).json(
          createErrorResponse({
            message: "Validation failed",
            additionalData: {
              errors: validationErrors,
              errorMessages,
            },
          })
        );
      }

      return res.status(500).json(
        createErrorResponse({
          message: "Internal server error",
          statusCode: 500,
          additionalData: {
            error:
              process.env.NODE_ENV === "development"
                ? (error as Error)?.message
                : "Something went wrong",
          },
        })
      );
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await DocGia.findById(req.user?._id);
      if (!user) {
        return res.status(404).json(
          createErrorResponse({
            message: "User not found",
            statusCode: 404,
          })
        );
      }

      if (user.isBanned) {
        const code = 403;
        return res.status(code).json(
          createErrorResponse({
            message: "User is banned",
            statusCode: code,
          })
        );
      }

      return res.json(
        createSuccessResponse({
          message: "Get user successfully",
          data: {
            user: formatUserResponse(user as any),
          },
        })
      );
    } catch (error) {
      return res.status(500).json(
        createErrorResponse({
          message: "Fail to get user. Something went wrong.",
        })
      );
    }
  }

  logout(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json({ message: "Đăng xuất thành công." });
  }
}

export default new UserAuthController();
