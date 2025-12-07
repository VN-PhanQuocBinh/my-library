import DocGia from "../models/DocGia.ts";
import NhanVien from "../models/NhanVien.ts";
import type { INhanVienWithId } from "../types/user-schema.ts";
import type { IDocGiaWithId } from "../types/user-schema.ts";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import blackListController from "../controllers/black-list-controller.ts";

import { createErrorResponse } from "../utils/response.ts";
import { JWT_SECRET } from "../config/env.ts";

import getToken from "../services/get-token.service.ts";

export default async function (
  req: Request & { user?: IDocGiaWithId | INhanVienWithId },
  res: Response,
  next: NextFunction
) {
  try {
    const token = getToken(req);

    if (!token) {
      const code = 401;
      return res.status(code).json(
        createErrorResponse({
          message: "Token is required",
          statusCode: code,
        })
      );
    }

    const isBlacklisted = await blackListController.isBlacklisted(token);
    if (isBlacklisted) {
      const code = 401;
      return res.status(code).json(
        createErrorResponse({
          message: "Token has been revoked",
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
        role: admin.toObject().duty,
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
