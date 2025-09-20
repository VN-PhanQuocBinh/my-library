import mongoose from "mongoose";
import type { Request } from "express";

interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PaginateResponse<T> {
  list: T[];
  pagination: PaginationResult;
}

const paginate = async <T = any>(
  req: Request,
  Model: mongoose.Model<T>,
  populate: string | string[] = "",
  options: mongoose.QueryOptions = {}
): Promise<PaginateResponse<T>> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 0;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const totalCount = await Model.countDocuments({});
    const skipIndex = page * limit;
    const totalPages = Math.ceil(totalCount / limit);

    const list = await Model.find(options)
      .skip(skipIndex)
      .limit(limit)
      .populate(populate)
      .lean<T[]>(); // Thêm .lean() để trả về plain object thay vì Mongoose document

    const pagination = {
      page,
      limit,
      total: totalCount,
      totalPages,
    };

    return {
      list,
      pagination,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown pagination error";
    throw new Error(`Pagination error: ${errorMessage}`);
  }
};

export default paginate;
