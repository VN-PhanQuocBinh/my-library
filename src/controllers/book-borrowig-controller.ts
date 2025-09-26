import TheoDoiMuonSach from "../models/TheoDoiMuonSach.ts";
import DocGia from "../models/DocGia.ts";
import Sach from "../models/Sach.ts";

import type { Request, Response } from "express";
import paginate from "../utils/paginate.ts";

import {
  generateErrorResponse,
  generateSuccessResponse,
} from "../utils/response.ts";

class BookBorrowingController {
  async getAllBorrowings(req: Request, res: Response): Promise<any> {
    try {
      const borrowings = await paginate(req, TheoDoiMuonSach, [
        "userId",
        "bookId",
      ]);
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
      console.log("Existing book:", existingBook);
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

  async updateBorrowing(req: Request, res: Response): Promise<any> {
    try {
      const borrowingId = req.params.id;
      const { status } = req.body;

      const borrowing = await TheoDoiMuonSach.findById(borrowingId);
      if (!borrowing) {
        return res.status(404).json({ message: "Borrowing record not found" });
      }

      borrowing.status = status;
      await borrowing.save();

      return generateSuccessResponse({
        res,
        message: "Borrowing record updated successfully",
        data: borrowing,
        statusCode: 200,
      });
    } catch (error) {
      console.error("Error updating borrowing record:", error);
      return generateErrorResponse({
        res,
        message: "Failed to update borrowing record",
        errorDetails: error,
        statusCode: 500,
      });
    }
  }

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
}

export default new BookBorrowingController();
