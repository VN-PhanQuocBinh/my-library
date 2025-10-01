import Sach from "../models/Sach.ts";
import NhaXuatBan from "../models/NhaXuatBan.ts";
import type { Request, Response } from "express";
import multer from "multer";
import { uploadImages, deleteImages } from "../utils/image-cloud-service.ts";
import { IMAGE_UPLOAD_PATH } from "../config/config.ts";

import {
  generateErrorResponse,
  generateSuccessResponse,
} from "../utils/response.ts";

import type { ISach, ImageInfo } from "../types/sach.ts";
import pagnigate from "../utils/paginate.ts";

interface BookCreateRequest extends Request {
  body: Partial<ISach>;
  files?: Record<string, Express.Multer.File[]>;
}

interface BookUpdateRequest extends Request {
  body: Partial<ISach> & {
    oldRemovedCoverImage?: string;
    oldRemovedDetailedImages?: string[];
  };
  files?: Record<string, Express.Multer.File[]>;
}

// Configure multer for file uploads
export const upload = multer();

// Define paths for image uploads
const COVER_IMAGES_PATH =
  IMAGE_UPLOAD_PATH.BOOK.COVER_IMAGE || "book/images/covers";
const DETAILED_IMAGES_PATH =
  IMAGE_UPLOAD_PATH.BOOK.DETAILED_IMAGE || "book/images/details";

const uploadCoverImage = async (coverImage: Express.Multer.File[]) => {
  if (!coverImage || coverImage.length === 0 || !coverImage[0]) {
    throw new Error("No cover image file provided");
  }

  try {
    if (coverImage && coverImage.length > 0 && coverImage[0]) {
      console.log("Uploading cover image ne...");
      const coverImageUpload: any = await uploadImages(
        coverImage[0].buffer,
        COVER_IMAGES_PATH
      );

      const storedImageInfo: ImageInfo = {
        url: coverImageUpload.secure_url,
        publicId: coverImageUpload.public_id,
        folder: coverImageUpload.folder,
        size: coverImageUpload.bytes,
        format: coverImageUpload.format,
        width: coverImageUpload.width,
        height: coverImageUpload.height,
        uploadedAt: new Date(),
      };

      return storedImageInfo;
    }
  } catch (error) {
    throw new Error("Failed to upload cover image");
  }
};

const uploadDetailedImages = async (detailedImages: Express.Multer.File[]) => {
  if (!detailedImages || detailedImages.length === 0)
    throw new Error("No detailed image files provided");

  try {
    const imageUploadPromises = detailedImages.map((image) =>
      uploadImages(image.buffer, DETAILED_IMAGES_PATH)
    );

    const uploadedImages = await Promise.all(imageUploadPromises);
    const storedDetailedImages = uploadedImages.map((img: any) => {
      const storedImageInfo: ImageInfo = {
        url: img.secure_url,
        publicId: img.public_id,
        folder: img.folder,
        originalName: img.originalname,
        size: img.bytes,
        format: img.format,
        width: img.width,
        height: img.height,
        uploadedAt: new Date(),
      };
      return storedImageInfo;
    });

    return storedDetailedImages;
  } catch (error) {
    throw new Error("Failed to upload detailed images");
  }
};

// Book Controller
class BookController {
  createBook = async (req: BookCreateRequest, res: Response): Promise<any> => {
    try {
      const payload = req.body;

      if (payload.price && typeof payload.price === "string") {
        payload.price = JSON.parse(payload.price);
      }

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

      // Upload cover image
      if (coverImage && coverImage.length > 0) {
        try {
          console.log("Uploading cover image...");
          payload.coverImage = (await uploadCoverImage(coverImage)) || null;
        } catch (error) {
          return generateErrorResponse({
            res,
            message: "Failed to upload cover image",
            errorDetails: error,
            statusCode: 500,
          });
        }
      } else {
        return generateErrorResponse({
          res,
          message: "Cover image is required",
          errorDetails: null,
          statusCode: 400,
        });
      }

      // Upload detailed images if provided
      if (detailedImages && detailedImages.length > 0) {
        try {
          console.log("Uploading detailed images...");
          payload.detailedImages = await uploadDetailedImages(detailedImages);
        } catch (error) {
          return generateErrorResponse({
            res,
            message: "Failed to upload detailed images",
            errorDetails: error,
            statusCode: 500,
          });
        }
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
      console.error("Error creating book:", error);
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
            { normalizedName: { $regex: regex } },
            { normalizedAuthor: { $regex: regex } },
            { normalizedGenre: { $regex: regex } },
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

  updateBook = async (req: BookUpdateRequest, res: Response): Promise<any> => {
    try {
      const bookId = req.params.id;
      const payload = req.body;
      const { oldRemovedCoverImage, oldRemovedDetailedImages } = payload;

      const existingBook = await Sach.findById(bookId);
      if (!existingBook) {
        return generateErrorResponse({
          res,
          message: "Book not found",
          errorDetails: null,
          statusCode: 404,
        });
      }

      if (oldRemovedCoverImage) {
        try {
          await deleteImages(oldRemovedCoverImage);
          existingBook.coverImage = null;
        } catch (error) {
          return generateErrorResponse({
            res,
            message: "Failed to delete old cover image",
            errorDetails: error,
            data: payload,
            statusCode: 500,
          });
        }
      }

      if (oldRemovedDetailedImages) {
        try {
          await deleteImages(oldRemovedDetailedImages);
          existingBook.detailedImages =
            existingBook.detailedImages?.filter(
              (img) => !oldRemovedDetailedImages.includes(img.publicId)
            ) || [];
        } catch (error) {
          return generateErrorResponse({
            res,
            message: "Failed to delete old detailed images",
            errorDetails: error,
            statusCode: 500,
          });
        }
      }

      if (!req.files) {
        return generateErrorResponse({
          res,
          message: "No files uploaded",
          errorDetails: null,
          statusCode: 400,
        });
      }

      // Handle file uploads
      const { coverImage, detailedImages } = req.files;

      // Upload cover image
      if (coverImage && coverImage.length > 0) {
        try {
          console.log("Uploading cover image...");

          if (existingBook.coverImage && existingBook.coverImage.publicId) {
            await deleteImages(existingBook.coverImage.publicId);
            existingBook.coverImage = null;
          }

          payload.coverImage = (await uploadCoverImage(coverImage)) || null;
        } catch (error) {
          return generateErrorResponse({
            res,
            message: "Failed to upload cover image",
            errorDetails: error,
            statusCode: 500,
          });
        }
      }

      // Upload detailed images if provided
      if (detailedImages && detailedImages.length > 0) {
        try {
          console.log("Uploading detailed images...");
          const newDetailedImages =
            (await uploadDetailedImages(detailedImages)) || [];
          payload.detailedImages = [
            ...(existingBook.detailedImages || []),
            ...newDetailedImages,
          ];
        } catch (error) {
          return generateErrorResponse({
            res,
            message: "Failed to upload detailed images",
            errorDetails: error,
            statusCode: 500,
          });
        }
      }

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
