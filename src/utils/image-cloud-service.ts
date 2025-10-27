import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import streamifier from "streamifier";

// load environment variables from .env file
dotenv.config();

// configure cloudinary
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  throw new Error("Missing Cloudinary environment variables");
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

export function uploadImages(
  imageBuffer: Buffer,
  folder: string = "library/images"
) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );
    streamifier.createReadStream(imageBuffer).pipe(uploadStream);
  });
}

export function deleteImages(publicIds: string | string[]) {
  return new Promise((resolve, reject) => {
    // Chuyển đổi thành array nếu là string
    const idsArray = Array.isArray(publicIds) ? publicIds : [publicIds];

    if (
      idsArray.length === 0 ||
      idsArray.some((id) => !id || typeof id !== "string")
    ) {
      return reject(
        new Error("Valid public ID(s) required to delete image(s)")
      );
    }

    cloudinary.api.delete_resources(
      idsArray,
      { resource_type: "image" },
      (error, result) => {
        if (error) {
          return reject(
            new Error(`Failed to delete image(s): ${error.message}`)
          );
        }

        resolve({
          success: true,
          message: `Successfully processed ${idsArray.length} image(s)`,
          result,
          deleted: result.deleted || {},
          not_found: result.not_found || [],
        });
      }
    );
  });
}
