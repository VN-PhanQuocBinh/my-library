import DocGia from "../models/DocGia.ts";
import NhanVien from "../models/NhanVien.ts";
import type { INhanVienWithId } from "../types/user-schema.ts";
import type { IDocGiaWithId } from "../types/user-schema.ts";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { createErrorResponse } from "../utils/response.ts";
import { JWT_SECRET } from "../config/env.ts";

export default async function (
  req: Request & { user?: IDocGiaWithId | INhanVienWithId },
  res: Response,
  next: NextFunction
) {
  let token;

  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      const code = 401;
      return res.status(code).json(
        createErrorResponse({
          message: "Token is required",
          statusCode: code,
        })
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const admin = await NhanVien.findById(decoded.sub).select("+passwordHash");

    if (admin) {
      req.user = {
        ...admin.toObject(),
        _id: admin._id.toString(),
        role: "admin",
      };
      return next();
    }

    const reader = await DocGia.findById(decoded.sub).select("+passwordHash");
    if (reader) {
      req.user = {
        ...reader.toObject(),
        _id: reader._id.toString(),
        role: "reader",
      };
      return next();
    }

    const code = 401;
    return res.status(code).json(
      createErrorResponse({
        message: "User not found",
        statusCode: code,
      })
    );
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      const code = 401;
      let message = "Invalid token";

      if (error instanceof jwt.TokenExpiredError) {
        message = "Token expired";
      } else if (error instanceof jwt.NotBeforeError) {
        message = "Token not active";
      }

      return res.status(code).json(
        createErrorResponse({
          message,
          statusCode: code,
        })
      );
    }

    // Handle other errors
    const code = 500;
    return res.status(code).json(
      createErrorResponse({
        message: "Internal server error",
        statusCode: code,
      })
    );
  }
}
