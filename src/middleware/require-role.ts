import type { NextFunction, RequestHandler, Request, Response } from "express";
import {
  createSuccessResponse,
  createErrorResponse,
} from "../utils/response.ts";

import DocGia from "../models/DocGia.ts";
import NhanVien from "../models/NhanVien.ts";
import type { IDocGiaWithId } from "../types/user-schema.ts";
import type { INhanVienWithId } from "../types/user-schema.ts";

export default function requireRole(
  roles: ("reader" | "admin")[]
): RequestHandler | void {
  try {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userRole = req.user?.role;
        console.log("User role:", roles, userRole)
        if (!userRole) {
          return res.status(401).json(
            createErrorResponse({
              message: "Unauthorized",
              statusCode: 401,
            })
          );
        }

        if (!roles.includes(userRole)) {
          return res.status(403).json(
            createErrorResponse({
              message: "Forbidden: Insufficient role",
              statusCode: 403,
            })
          );
        }

        next();
      } catch (error) {
        const code = 500;
        return res.status(code).json(
          createErrorResponse({
            message: "Internal server error",
            statusCode: code,
            additionalData: error,
          })
        );
      }
    };
  } catch (error) {}
}
