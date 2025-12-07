import TheoDoiMuonSach from "../models/TheoDoiMuonSach.ts";
import type { TheoDoiMuonSach as ITheoDoiMuonSach } from "../types/theo-doi-muon-sach.ts";
import DocGia from "../models/DocGia.ts";
import Sach from "../models/Sach.ts";
import type { borrowingStatus } from "../types/theo-doi-muon-sach.ts";

import type { Request, Response } from "express";
import paginate from "../utils/paginate.ts";

import {
  generateErrorResponse,
  generateSuccessResponse,
} from "../utils/response.ts";

import { PenaltyService } from "../services/penalty.service.ts";
import mongoose from "mongoose";

const MAX_BOOK_BORROW = 5;

// Map defining quantity changes for valid state transitions
const changeValue = new Map<`${borrowingStatus}-${borrowingStatus}`, number>()
  .set("pending-approved", -1)
  .set("pending-rejected", 0)
  .set("approved-returned", 1)
  .set("approved-overdue", 0)
  .set("approved-lost", 0)
  .set("overdue-returned", 1)
  .set("overdue-lost", 0);

// Function to get quantity change based on state transition
function getQuantityChange(
  oldState: borrowingStatus,
  newState: borrowingStatus
): { quantityChange: number; errorMessage?: string | undefined } {
  let value = 0;
  let errorMessage = undefined;

  if (!changeValue.has(`${oldState}-${newState}`)) {
    errorMessage = `Invalid state transition from ${oldState} to ${newState}`;
  }

  value = changeValue.get(`${oldState}-${newState}`) || 0;
  return { quantityChange: value, errorMessage };
}

const updateBorrowingStatus = async (borrowing: ITheoDoiMuonSach) => {
  if (!borrowing.borrowedAt) return borrowing;

  let returnDate = new Date(borrowing.borrowedAt || "");
  returnDate.setDate(returnDate.getDate() + (borrowing.maxBorrowDays || 14));

  const isOverdue = new Date() > returnDate;
  // if (isOverdue) {
  //   PenaltyService.calculateAndApplyPenalties(borrowing._id as any);
  // }

  if (isOverdue && changeValue.has(`${borrowing.status}-overdue`)) {
    borrowing.status = "overdue";

    await TheoDoiMuonSach.findByIdAndUpdate(borrowing._id, {
      status: "overdue",
    }).exec();
  }

  return borrowing;
};

// Controller for book borrowing operations
class BookBorrowingController {
  async getAllBorrowings(req: Request, res: Response): Promise<any> {
    try {
      const { status } = req.query;
      let filterOptions: any = {};

      if (status) {
        filterOptions.status = status;
      }

      const borrowings = await paginate(
        req,
        TheoDoiMuonSach,
        ["userId", "bookId"],
        filterOptions
      );

      for (const borrowing of borrowings.list) {
        await updateBorrowingStatus(borrowing);
      }

      return generateSuccessResponse({
        res,
        message: "Fetched all borrowings successfully",
        data: borrowings,
      });
    } catch (error) {
      console.error("Error fetching borrowings:", error);
      return generateErrorResponse({
        res,
        message: "Failed to fetch borrowings",
        errorDetails: error,
        statusCode: 500,
      });
    }
  }

  async borrowBook(req: Request, res: Response): Promise<any> {
    try {
      const { userId, bookId } = req.body;

      const existingUser = await DocGia.findById(userId);
      if (!existingUser) {
        return generateErrorResponse({
          res,
          statusCode: 404,
          message: "User not found",
          errorDetails: "No user with the given ID",
        });
      }

      const existingBook = await Sach.findById(bookId);
      if (!existingBook) {
        return generateErrorResponse({
          res,
          statusCode: 404,
          message: "Book not found",
          errorDetails: "No book with the given ID",
        });
      }

      const existingBorrowing = await TheoDoiMuonSach.findOne({
        userId,
        bookId,
        status: { $in: ["pending", "approved"] },
      });

      if (existingBorrowing) {
        return generateErrorResponse({
          res,
          statusCode: 409,
          message: "Book is already borrowed",
          errorDetails: "User has an active borrowing record for this book",
        });
      }

      const newBorrowing = new TheoDoiMuonSach({
        userId,
        bookId,
      });

      await newBorrowing.save();
      existingBook.quantity -= 1;
      await existingBook.save();

      return generateSuccessResponse({
        res,
        statusCode: 201,
        message: "Book borrowing recorded successfully",
        data: newBorrowing,
      });
    } catch (error) {
      console.error("Error borrowing book:", error);
      return generateErrorResponse({
        res,
        message: "Failed to borrow book",
        errorDetails: error,
        statusCode: 500,
      });
    }
  }

  async registerBorrowing(req: Request, res: Response): Promise<any> {
    try {
      const userId = req.user?._id;
      const { bookId } = req.body;

      if (!userId) {
        return generateErrorResponse({
          res,
          statusCode: 401,
          message: "Unauthorized",
          errorDetails: "User not authenticated",
        });
      }

      const existingBook = await Sach.findById(bookId);
      if (!existingBook) {
        return generateErrorResponse({
          res,
          statusCode: 404,
          message: "Book not found",
          errorDetails: "No book with the given ID",
        });
      }

      const existingBorrowing = await TheoDoiMuonSach.findOne({
        userId,
        bookId,
        status: { $in: ["pending", "approved"] },
      });

      if (existingBorrowing) {
        return generateErrorResponse({
          res,
          statusCode: 409,
          message: "Book is already borrowed",
          errorDetails: "User has an active borrowing record for this book",
        });
      }

      const userBorrowCount = await TheoDoiMuonSach.countDocuments({
        userId,
        status: { $in: ["pending", "approved", "overdue", "lost"] },
      });

      if (userBorrowCount >= MAX_BOOK_BORROW) {
        return generateErrorResponse({
          res,
          statusCode: 400,
          message: "Borrowing limit reached",
          errorDetails: "User has reached the maximum number of borrowed books",
        });
      }

      const newBorrowing = new TheoDoiMuonSach({
        userId,
        bookId,
      });

      await newBorrowing.save();

      return generateSuccessResponse({
        res,
        statusCode: 201,
        message: "Book borrowing recorded successfully",
        data: newBorrowing,
      });
    } catch (error) {
      console.error("Error registering borrowing:", error);
      return generateErrorResponse({
        res,
        message: "Failed to register borrowing",
        errorDetails: error,
        statusCode: 500,
      });
    }
  }

  async updateBorrowing(req: Request, res: Response): Promise<any> {
    try {
      const borrowingId = req.params.id;
      const { status } = req.body;
      const staffId = req.user?._id;

      // Find the borrowing record
      const borrowing = await TheoDoiMuonSach.findById(borrowingId);
      if (!borrowing) {
        return res.status(404).json({ message: "Borrowing record not found" });
      }

      // Find the associated book
      const book = await Sach.findById(borrowing.bookId);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }

      // Find the associated user
      const user = await DocGia.findById(borrowing.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Determine the quantity change based on status transition
      const { quantityChange, errorMessage } = getQuantityChange(
        borrowing.status,
        status
      );

      if (errorMessage) {
        return res.status(400).json({ message: errorMessage });
      }

      // Update book quantity and borrowing status
      book.quantity += quantityChange;

      switch (status) {
        case "approved":
          if (!borrowing.borrowedAt) {
            borrowing.borrowedAt = new Date();
          }
          break;
        case "returned":
          borrowing.returnedAt = new Date();
          break;
        case "lost":
          user.totalDebt += book.price.original || 0;
          break;
        case "returned":
        case "lost":
        default:
      }

      borrowing.status = status;
      borrowing.staffId = staffId as unknown as mongoose.Schema.Types.ObjectId;
      await PenaltyService.calculateAndApplyPenalties(borrowingId || "");

      await borrowing.save();
      await book.save();
      await user.save();

      return res.status(200).json(
        generateSuccessResponse({
          res,
          message: "Borrowing record updated successfully",
          data: borrowing,
          statusCode: 200,
        })
      );
    } catch (error) {
      console.error("Error updating borrowing record:", error);
      return res.json(
        generateErrorResponse({
          res,
          message: "Failed to update borrowing record",
          errorDetails: error,
          statusCode: 500,
        })
      );
    }
  }

  // New method to handle book returns for ADMIN roles
  async returnBook(req: Request, res: Response) {
    const borrowingId = req.params.id;
    const borrowing = await TheoDoiMuonSach.findById(borrowingId);
    if (!borrowing) {
      return res.status(404).json({ message: "Borrowing record not found" });
    }
    borrowing.status = "returned";
    borrowing.returnedAt = new Date();
    await borrowing.save();
    return res.status(200).json({ message: "Book returned successfully" });
  }

  async getUserBorrowings(req: any, res: any): Promise<any> {
    try {
      const userId = req.user?._id;
      const borrowings = await paginate(req, TheoDoiMuonSach, "bookId", {
        userId,
      });

      if (!userId) {
        return generateErrorResponse({
          res,
          statusCode: 401,
          message: "Unauthorized",
          errorDetails: "User not authenticated",
        });
      }

      for (const borrowing of borrowings.list) {
        await updateBorrowingStatus(borrowing);
      }

      return generateSuccessResponse({
        res,
        message: "Fetched user borrowings successfully",
        data: borrowings,
      });
    } catch (error) {
      console.error("Error fetching user borrowings:", error);
      return generateErrorResponse({
        res,
        message: "Failed to fetch user borrowings",
        errorDetails: error,
        statusCode: 500,
      });
    }
  }
}

export default new BookBorrowingController();
