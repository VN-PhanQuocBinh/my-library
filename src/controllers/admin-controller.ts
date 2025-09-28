import NhanVien from "../models/NhanVien.ts";
import paginate from "../utils/paginate.ts";
import bcrypt from "bcryptjs";

import type { Response, Request } from "express";
import jwt from "jsonwebtoken";

import {
  generateErrorResponse,
  generateSuccessResponse,
} from "../utils/response.ts";

import { formatUserResponse } from "../utils/response.ts";

import type { INhanVienWithId } from "../types/nhan-vien.ts";
import type { StaffJWTPayload } from "../types/request.ts";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "1 day";

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

class AdminController {
  async getAllAdmins(req: Request, res: Response): Promise<any> {
    try {
      const admins = await paginate(req, NhanVien, "");
      return generateSuccessResponse({
        res,
        message: "Admins fetched successfully",
        data: admins,
      });
    } catch (error) {
      return generateErrorResponse({
        res,
        message: "Error fetching admins",
        errorDetails: error,
        statusCode: 500,
      });
    }
  }

  async createAdmin(req: Request, res: Response): Promise<any> {
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
      const user = new NhanVien({
        ...payload,
        passwordHash,
      });

      await user.save();

      return generateSuccessResponse({
        res,
        message: "Admin created successfully",
        data: {
          email: user.email,
          password: password,
        },
      });
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

        return generateErrorResponse({
          res,
          message: "Validation error",
          errorDetails: validationErrors,
        });
      }

      return generateErrorResponse({
        res,
        message: "Error creating admin",
        errorDetails: error,
        statusCode: 500,
      });
    }
  }

  async updateAdmin(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const { fullname, duty, phoneNumber, address } = req.body;

      // Find admin by ID
      const admin = await NhanVien.findById(id);
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      // Update admin details
      admin.fullname = fullname;
      admin.duty = duty || admin.duty;
      admin.phoneNumber = phoneNumber || admin.phoneNumber;
      admin.address = address || admin.address;

      await admin.save();

      return generateSuccessResponse({
        res,
        message: "Admin updated successfully",
        data: admin,
      });
    } catch (error) {
      return generateErrorResponse({
        res,
        message: "Error updating admin",
        errorDetails: error,
        statusCode: 500,
      });
    }
  }

  async changePassword(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      const admin = await NhanVien.findById(id).select("+passwordHash");
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      const newHashedPassword = await bcrypt.hash(newPassword, 10);
      admin.passwordHash = newHashedPassword;
      await admin.save();

      return generateSuccessResponse({
        res,
        message: "Password changed successfully",
        data: null,
      });
    } catch (error) {
      return generateErrorResponse({
        res,
        message: "Error changing password",
        errorDetails: error,
        statusCode: 500,
      });
    }
  }
}

export default new AdminController();
