import DocGia from "../models/DocGia.ts";
import paginate from "../utils/paginate.ts";

import type { Response, Request } from "express";

import {
  generateErrorResponse,
  generateSuccessResponse,
} from "../utils/response.ts";

class UserController {
  async getAllUsers(req: Request, res: Response): Promise<any> {
    try {
      const users = await paginate(req, DocGia);

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
}

export default new UserController();
