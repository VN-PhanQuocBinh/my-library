import { v2 as cloudinary } from "cloudinary";

export default async function uploadImages(
  imagePath: string,
  folder: string = "library/images"
) {
  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      folder,
    });
    return result;
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw error;
  }
}