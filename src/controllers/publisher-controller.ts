import NhaXuatBan from "../models/NhaXuatBan.ts";
import type { Request, Response } from "express";
import type { INhaXuatBan } from "../types/nha-xuat-ban.ts";
import pagnigate from "../utils/paginate.ts";

import {
  generateSuccessResponse,
  generateErrorResponse,
} from "../utils/response.ts";
import type { normalize } from "path";

interface PublisherRequest extends Request {
  body: Pick<INhaXuatBan, "name" | "address">;
}

class PublisherController {
  createPublisher = async (
    req: PublisherRequest,
    res: Response
  ): Promise<any> => {
    try {
      const { name, address } = req.body;
      const newPublisher = new NhaXuatBan({ name, address });
      await newPublisher.save();

      return generateSuccessResponse({
        res,
        message: "Publisher created successfully",
        data: newPublisher,
        statusCode: 201,
      });
    } catch (error: unknown) {
      console.error("Error creating publisher:", error);

      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      return generateErrorResponse({
        res,
        message: "Failed to create publisher",
        errorDetails: errorMessage,
      });
    }
  };

  getAllPublishers = async (req: Request, res: Response): Promise<any> => {
    try {
      const { query } = req.query;

      let searchOption: any = {};
      if (query) {
        const regex = new RegExp(String(query), "i");
        searchOption = {
          $or: [
            { normalizedName: { $regex: regex } },
            { normalizedAddress: { $regex: regex } },
          ],
        };
      }

      const publishers = await pagnigate<INhaXuatBan>(
        req,
        NhaXuatBan,
        "",
        searchOption
      );
      return generateSuccessResponse({
        res,
        message: "Publishers retrieved successfully",
        data: publishers,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      return generateErrorResponse({
        res,
        message: "Failed to retrieve publishers",
        errorDetails: errorMessage,
      });
    }
  };

  updatePublisher = async (req: Request, res: Response): Promise<any> => {
    try {
      const { id } = req.params;
      const { name, address } = req.body;

      const updatedPublisher = await NhaXuatBan.findByIdAndUpdate(
        id,
        { name, address },
        { new: true, runValidators: true }
      );

      if (!updatedPublisher) {
        return generateErrorResponse({
          res,
          message: "Publisher not found",
          errorDetails: "No publisher found with the provided ID",
          statusCode: 404,
        });
      }

      return generateSuccessResponse({
        res,
        message: "Publisher updated successfully",
        data: updatedPublisher,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      return generateErrorResponse({
        res,
        message: "Failed to update publisher",
        errorDetails: errorMessage,
      });
    }
  };

  deletePublisher = async (req: Request, res: Response): Promise<any> => {
    try {
      const { id } = req.params;

      const isExisting = await NhaXuatBan.findById(id);
      if (!isExisting) {
        return generateErrorResponse({
          res,
          message: "Publisher not found",
          errorDetails: "No publisher found with the provided ID",
          statusCode: 404,
        });
      }

      const deletedPublisher = await NhaXuatBan.findByIdAndDelete(id);

      if (!deletedPublisher) {
        return generateErrorResponse({
          res,
          message: "Publisher not found",
          errorDetails: "No publisher found with the provided ID",
          statusCode: 404,
        });
      }

      return generateSuccessResponse({
        res,
        message: "Publisher deleted successfully",
        data: deletedPublisher,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      return generateErrorResponse({
        res,
        message: "Failed to delete publisher",
        errorDetails: errorMessage,
      });
    }
  };
}

export default new PublisherController();
