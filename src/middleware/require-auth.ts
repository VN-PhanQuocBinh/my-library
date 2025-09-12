import DocGia from "../models/DocGia.ts";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { createErrorResponse } from "../utils/response.ts";
import { decode } from "punycode";

export default async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  let token;

  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split("")[1];
      // } else if (req.session && req.session.userId && false) {
      //   const user = await DocGia.findById(req.session.userId).select(
      //     "+password"
      //   );

      //   // Check active
      //   //.......
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

    const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await DocGia.findById(decoded.sub).select("+passwordHash");

    if (!user) {
      const code = 401;
      return res.status(code).json(
        createErrorResponse({
          message: "User not found",
          statusCode: code,
        })
      );
    }

    next();
  } catch (error) {
    // Handle JWT errors specifically
    let code = 500;

    if (error instanceof jwt.JsonWebTokenError) {
      code = 401;
      return res.status(code).json(
        createErrorResponse({
          message: "Invalid token",
          statusCode: code,
        })
      );
    }

    return res.status(code).json(
      createErrorResponse({
        message: "Something went wrong",
        statusCode: code,
        additionalData: error,
      })
    );
  }
}
