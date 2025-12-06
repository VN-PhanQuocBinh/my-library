import type { Request, Response, NextFunction } from "express";
import Blacklist from "../models/Blacklist.ts";
import { createErrorResponse } from "../utils/response.ts";
import getToken from "../services/get-token.service.ts";

export default async function checkBlacklist(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = getToken(req);

    if (token) {
      const blacklistedToken = await Blacklist.findOne({ token });
      if (blacklistedToken) {
        const code = 401;
        return res.status(code).json(
          createErrorResponse({
            message: "Token has been revoked",
            statusCode: code,
          })
        );
      }
    }

    next();
  } catch (error) {
    const code = 500;
    return res.status(code).json(
      createErrorResponse({
        message: "Error checking token blacklist",
        statusCode: code,
      })
    );
  }
}
