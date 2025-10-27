import DocGia from "../models/DocGia.ts";
import paginate from "../utils/paginate.ts";
import bcrypt from "bcryptjs";

import type { Response, Request } from "express";

import {
  generateErrorResponse,
  generateSuccessResponse,
} from "../utils/response.ts";

import { createSearchOptions } from "../utils/create-search-options.ts";

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

class UserController {
  async getAllUsers(req: Request, res: Response): Promise<any> {
    try {
      const { query, gender, status } = req.query;

      const searchOption = createSearchOptions(
        query as string,
        ["normalizedFullname", "email"],
        {
          gender: {
            value: gender as string,
            condition: ["male", "female", "other"].includes(gender as string),
          },
          status: {
            value: status as string,
            condition: ["active", "inactive", "banned"].includes(
              status as string
            ),
          },
        }
      );

      console.log("Search Option:", searchOption);

      // Exclude sensitive fields
      const users = await paginate(req, DocGia, "", searchOption);

      return generateSuccessResponse({
        res,
        message: "Users fetched successfully",
        data: users,
      });
    } catch (error) {
      return generateErrorResponse({
        res,
        message: "Error fetching users",
        errorDetails: error,
        statusCode: 500,
      });
    }
  }

  async createUser(req: Request, res: Response): Promise<any> {
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
      const user = new DocGia({
        ...payload,
        passwordHash,
      });

      await user.save();

      return generateSuccessResponse({
        res,
        message: "User created successfully",
        data: {
          email: user.email,
          password: password,
        },
      });
    } catch (error: unknown) {
      console.error("Create user error:", error);
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
        message: "Error creating user",
        errorDetails: error,
        statusCode: 500,
      });
    }
  }

  async updateUser(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const { firstname, lastname, gender, dateOfBirth, phoneNumber, address, status } =
        req.body;

      // Find user by ID
      const user = await DocGia.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update user details
      user.firstname = firstname || user.firstname;
      user.lastname = lastname || user.lastname;
      user.gender = gender || user.gender;
      user.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : user.dateOfBirth;
      user.phoneNumber = phoneNumber || user.phoneNumber;
      user.address = address || user.address;
      user.status = status || user.status;

      await user.save();

      // Return user without password
      const userResponse = user.toObject();
      delete userResponse.passwordHash;

      return generateSuccessResponse({
        res,
        message: "User updated successfully",
        data: userResponse,
      });
    } catch (error) {
      return generateErrorResponse({
        res,
        message: "Error updating user",
        errorDetails: error,
        statusCode: 500,
      });
    }
  }

  async updateUserStatus(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validate status
      if (!["active", "inactive", "banned"].includes(status)) {
        return res.status(400).json({
          message: "Invalid status. Must be 'active', 'inactive', or 'banned'",
        });
      }

      // Find user by ID
      const user = await DocGia.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update user status
      user.status = status;
      await user.save();

      // Return user without password
      const userResponse = user.toObject();
      delete userResponse.passwordHash;

      return generateSuccessResponse({
        res,
        message: "User status updated successfully",
        data: userResponse,
      });
    } catch (error) {
      return generateErrorResponse({
        res,
        message: "Error updating user status",
        errorDetails: error,
        statusCode: 500,
      });
    }
  }

  async getUserById(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;

      const user = await DocGia.findById(id).select("-passwordHash");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return generateSuccessResponse({
        res,
        message: "User fetched successfully",
        data: user,
      });
    } catch (error) {
      return generateErrorResponse({
        res,
        message: "Error fetching user",
        errorDetails: error,
        statusCode: 500,
      });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      const user = await DocGia.findById(id).select("+passwordHash");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const newHashedPassword = await bcrypt.hash(newPassword, 10);
      user.passwordHash = newHashedPassword;
      await user.save();

      return generateSuccessResponse({
        res,
        message: "Password reset successfully",
        data: null,
      });
    } catch (error) {
      return generateErrorResponse({
        res,
        message: "Error resetting password",
        errorDetails: error,
        statusCode: 500,
      });
    }
  }

  async deleteUser(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;

      const user = await DocGia.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await DocGia.findByIdAndDelete(id);

      return generateSuccessResponse({
        res,
        message: "User deleted successfully",
        data: null,
      });
    } catch (error) {
      return generateErrorResponse({
        res,
        message: "Error deleting user",
        errorDetails: error,
        statusCode: 500,
      });
    }
  }
}

export default new UserController();
