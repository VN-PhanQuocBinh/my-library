import type { Request, Response } from "express";
import { createErrorResponse } from "../utils/response.ts";
import type { INhanVienWithId } from "../types/user-schema.ts";
import type { IDocGiaWithId } from "../types/doc-gia.ts";

export default async function checkStatusMiddleware(
  req: Request & {
    user?: IDocGiaWithId | (INhanVienWithId & { isBanned?: boolean });
  },
  res: Response,
  next: () => void
) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json(
        createErrorResponse({
          message: "User not authenticated",
          statusCode: 401,
        })
      );
    }

    if (user.role === "reader" && user.isBanned) {
      const bannedUntil = (user as IDocGiaWithId).currentBanUntil;

      return res.status(403).json(
        createErrorResponse({
          message: "User is banned",
          statusCode: 403,
          additionalData: {
            message: `You are banned until ${
              bannedUntil ? bannedUntil.toISOString() : "an unknown date"
            }`,
          },
        })
      );
    }

    // If all checks pass, proceed to the next middleware
    next();
  } catch (error) {
    const code = 500;
    return res.status(code).json(
      createErrorResponse({
        message: "Internal server error",
        statusCode: code,
      })
    );
  }
}
