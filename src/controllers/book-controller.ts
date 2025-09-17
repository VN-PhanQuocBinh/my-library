import Sach from "../models/Sach.ts";
import NhaXuatBan from "../models/NhaXuatBan.ts";
import type { Request, Response } from "express";

import {
  generateErrorResponse,
  generateSuccessResponse,
} from "../utils/response.ts";

import type { ISach } from "../types/sach.ts";
import pagnigate from "../utils/pagnigate.ts";

interface BookCreateRequest extends Request {
  body: Partial<ISach>;
  file?: Express.Multer.File;
  // files?: { [fieldname: string]: Express.Multer.File[] };
  files?: any[];
}

class BookController {
  createBook = async (req: BookCreateRequest, res: Response): Promise<any> => {
    try {
      const payload = req.body;
      console.log(req.files);
      return res.json({message: "ok"})
      // console.log(req.files);

      const existingPublisher = await NhaXuatBan.findById(payload.publisher);
      if (!existingPublisher) {
        return generateErrorResponse({
          res,
          message: "Invalid publisher ID",
          errorDetails: null,
          statusCode: 400,
        });
      }

      const newBook = new Sach(payload);
      await newBook.save();
      return generateSuccessResponse({
        res,
        message: "Book created successfully",
        data: newBook,
        statusCode: 201,
      });
    } catch (error) {
      return generateErrorResponse({
        res,
        message: "Failed to create book",
        errorDetails: error,
        statusCode: 500,
      });
    }
  };

  getAllBooks = async (req: Request, res: Response): Promise<any> => {
    try {
      const booksResult = await pagnigate<ISach>(req, Sach, "publisher", {});
      return generateSuccessResponse({
        res,
        message: "Books retrieved successfully",
        data: booksResult,
      });
    } catch (error) {
      return generateErrorResponse({
        res,
        message: "Failed to retrieve books",
        errorDetails: error,
        statusCode: 500,
      });
    }
  };

  updateBook = async (req: Request, res: Response): Promise<any> => {
    try {
      const bookId = req.params.id;
      const { name, price, quantity, publisher } = req.body;

      const updatedBook = await Sach.findByIdAndUpdate(
        bookId,
        { name, price, quantity, publisher },
        { new: true, runValidators: true }
      );

      if (!updatedBook) {
        return generateErrorResponse({
          res,
          message: "Book not found",
          errorDetails: null,
          statusCode: 404,
        });
      }

      return generateSuccessResponse({
        res,
        message: "Book updated successfully",
        data: updatedBook,
      });
    } catch (error) {
      return generateErrorResponse({
        res,
        message: "Failed to update book",
        errorDetails: error,
        statusCode: 500,
      });
    }
  };

  deleteBook = async (req: Request, res: Response): Promise<any> => {
    try {
      const bookId = req.params.id;

      const deletedBook = await Sach.findByIdAndUpdate(
        bookId,
        { status: false },
        { new: true }
      );

      if (!deletedBook) {
        return generateErrorResponse({
          res,
          message: "Book not found",
          errorDetails: null,
          statusCode: 404,
        });
      }

      return generateSuccessResponse({
        res,
        message: "Book deleted successfully",
        data: deletedBook,
      });
    } catch (error) {
      return generateErrorResponse({
        res,
        message: "Failed to delete book",
        errorDetails: error,
        statusCode: 500,
      });
    }
  };

  getBookById = async (req: Request, res: Response): Promise<any> => {
    try {
      const bookId = req.params.id;

      const book = await Sach.findById(bookId).populate("publisher");

      if (!book) {
        return generateErrorResponse({
          res,
          message: "Book not found",
          errorDetails: null,
          statusCode: 404,
        });
      }

      return generateSuccessResponse({
        res,
        message: "Book retrieved successfully",
        data: book,
      });
    } catch (error) {
      return generateErrorResponse({
        res,
        message: "Failed to retrieve book",
        errorDetails: error,
        statusCode: 500,
      });
    }
  };
}

export default new BookController();
