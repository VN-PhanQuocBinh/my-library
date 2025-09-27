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

interface CollationOptions {
  locale: string;
  strength?: number;
  caseLevel?: boolean;
  caseFirst?: string;
  numeric?: boolean;
  alternate?: string;
  maxVariable?: string;
  backwards?: boolean;
}

const paginate = async <T = any>(
  req: Request,
  Model: mongoose.Model<T>,
  populate: string | string[] = "",
  options: mongoose.QueryOptions = {}
): Promise<PaginateResponse<T>> => {
  try {
    const all = String(req.query.all) === "true";

    let list: T[];
    let pagination: PaginationResult;

    if (all) {
      list = await Model.find(options).populate(populate).lean<T[]>();
      pagination = {
        page: 0,
        limit: list.length,
        total: list.length,
        totalPages: 1,
      };
    } else {
      const page = parseInt(req.query.page as string, 10) || 0;
      const limit = parseInt(req.query.limit as string, 10) || 10;

      const totalCount = await Model.countDocuments(options);

      const skipIndex = page * limit;
      const totalPages = Math.ceil(totalCount / limit);

      list = await Model.find(options)
        .skip(skipIndex)
        .limit(limit)
        .populate(populate)
        .lean<T[]>();

      pagination = {
        page,
        limit,
        total: totalCount,
        totalPages,
      };
    }

    return { list, pagination };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown pagination error";
    throw new Error(`Pagination error: ${errorMessage}`);
  }
};

export default paginate;
