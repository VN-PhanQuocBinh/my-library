import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import NhanVien from "../models/NhanVien.ts";
import { Error } from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "1 day";

import {
  formatUserResponse,
  createSuccessResponse,
  createErrorResponse,
  generateSuccessResponse,
} from "../utils/response.ts";

import type {
  StaffJWTPayload,
  LoginRequest,
  StaffRegisterRequest,
} from "../types/request.ts";
import type { INhanVienWithId } from "../types/nhan-vien.ts";
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

const signUser = (user: INhanVienWithId): string => {
  const payload: StaffJWTPayload = {
    sub: user._id.toString(),
    email: user.email,
    fullname: user.fullname,
  };
  console.log(JWT_EXPIRES);
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1 day" });
};

class AdminAuthController {
  async login(req: LoginRequest, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      if (!email) {
        return res
          .status(400)
          .json(
            createErrorResponse({
              message: "Email is required",
              statusCode: 400,
            })
          );
      }

      const user = await NhanVien.findOne({ email }).select("+passwordHash");

      if (!user) {
        const code = 400;
        return res.status(code).json(
          createErrorResponse({
            message: "Email does not exist",
            statusCode: code,
          })
        );
      }

      const ok = await user.comparePassword(password);
      if (!ok) {
        const code = 401;
        return res.status(code).json(
          createErrorResponse({
            message: "Password is not correct",
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

  async register(req: StaffRegisterRequest, res: Response, next: NextFunction) {
    try {
      const { password, ...payload } = req.body;

      // Check email exists
      const isExist = await NhanVien.findOne({ email: payload.email });

      if (isExist) {
        return res.status(400).json({
          message: "Email already exist",
          email: payload.email,
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await NhanVien.create({ ...payload, passwordHash });
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
      console.error("Register error:", error); 
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

  logout(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json({ message: "Đăng xuất thành công." });
  }
}

export default new AdminAuthController();
