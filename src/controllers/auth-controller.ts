import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import DocGia from "../models/DocGia.ts";
import type { IDocGiaWithId } from "../types/doc-gia.ts";
import { Error } from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "1 day";

import {
  formatUserResponse,
  createSuccessResponse,
  createErrorResponse,
} from "../utils/response.ts";

interface JWTPayload {
  sub: string;
  email: string;
  firstname: string;
  lastname: string;
}

interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

interface RegisterRequest extends Request {
  body: {
    firstname: string;
    lastname: string;
    gender: "male" | "female" | "other";
    dateOfBirth: string;
    phoneNumber: string;
    email: string;
    password: string;
    address: string;
  };
}

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
  const payload: JWTPayload = {
    sub: user._id.toString(),
    email: user.email,
    firstname: user.firstname,
    lastname: user.lastname,
  };
  console.log(JWT_EXPIRES);
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1 day" });
};

class AuthController {
  async login(req: LoginRequest, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const user = await DocGia.findOne({ email }).select("+passwordHash");

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
            access_token: token,
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

  async register(req: RegisterRequest, res: Response, next: NextFunction) {
    try {
      const { password, ...payload } = req.body;

      // Check email exists
      const isExist = await DocGia.findOne({ email: payload.email });

      if (isExist) {
        return res.status(400).json({
          message: "Email already exist",
          email: payload.email,
        });
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

  // async logout(req, res, next) {}
}

export default new AuthController();
