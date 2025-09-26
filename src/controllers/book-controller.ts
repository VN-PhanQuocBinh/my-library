import Sach from "../models/Sach.ts";
import NhaXuatBan from "../models/NhaXuatBan.ts";
import type { Request, Response } from "express";
import multer from "multer";
import uploadImages from "../utils/upload-images.ts";
import { IMAGE_UPLOAD_PATH } from "../config/config.ts";

import {
  generateErrorResponse,
  generateSuccessResponse,
} from "../utils/response.ts";

import type { ISach } from "../types/sach.ts";
import pagnigate from "../utils/paginate.ts";

interface BookCreateRequest extends Request {
  body: Partial<ISach>;
  // file?: Express.Multer.File;
  files?: Record<string, Express.Multer.File[]>;
}

// Configure multer for file uploads
export const upload = multer();

// Define paths for image uploads
const COVER_IMAGES_PATH =
  IMAGE_UPLOAD_PATH.BOOK.COVER_IMAGE || "book/images/covers";
const DETAILED_IMAGES_PATH =
  IMAGE_UPLOAD_PATH.BOOK.DETAILED_IMAGE || "book/images/details";

// Book Controller
class BookController {
  createBook = async (req: BookCreateRequest, res: Response): Promise<any> => {
    try {
      const payload = req.body;

      if (payload.price && typeof payload.price === "string") {
        payload.price = JSON.parse(payload.price);
      }

      // console.log("Payload:", payload);
      // console.log(req.files);
      // return res.json({ message: "ok" });

      if (!req.files) {
        return generateErrorResponse({
          res,
          message: "No files uploaded",
          errorDetails: null,
          statusCode: 400,
        });
      }

      const existingPublisher = await NhaXuatBan.findById(payload.publisher);
      if (!existingPublisher) {
        return generateErrorResponse({
          res,
          message: "Invalid publisher ID",
          errorDetails: null,
          statusCode: 400,
        });
      }

      // Handle file uploads
      const { coverImage, detailedImages } = req.files;
      if (coverImage && coverImage.length > 0 && coverImage[0]) {
        const coverImageUpload: any = await uploadImages(
          coverImage[0].buffer,
          COVER_IMAGES_PATH
        );
        payload.coverImage = coverImageUpload.secure_url;
      }

      if (detailedImages && detailedImages.length > 0) {
        const imageUploadPromises = detailedImages.map((image) =>
          uploadImages(image.buffer, DETAILED_IMAGES_PATH)
        );

        const uploadedImages = await Promise.all(imageUploadPromises);
        payload.detailedImages = uploadedImages.map(
          (img: any) => img.secure_url
        );
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
      const { query, publisher, genre, status } = req.query;
      let searchOption: any = {};

      if (query) {
        const regex = new RegExp(String(query), "i");
        searchOption = {
          $or: [
            { name: { $regex: regex } },
            { author: { $regex: regex } },
            { genre: { $regex: regex } },
          ],
        };
      }

      if (publisher) {
        searchOption.publisher = publisher;
      }

      if (genre) {
        searchOption.genre = genre;
      }

      if (status) {
        if (status === "true") {
          searchOption.status = true;
        } else if (status === "false") {
          searchOption.status = false;
        }
      }

      const booksResult = await pagnigate<ISach>(
        req,
        Sach,
        "publisher",
        searchOption
      );
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
      const payload = req.body;

      console.log(payload);

      if (payload?.price && typeof payload.price === "string") {
        payload.price = JSON.parse(payload.price);
      }

      const updatedBook = await Sach.findByIdAndUpdate(bookId, payload, {
        new: true,
        runValidators: true,
      });

      if (!updatedBook) {
        return generateErrorResponse({
          res,
          message: "Book not found",
          data: payload,
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
        data: req.body,
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
