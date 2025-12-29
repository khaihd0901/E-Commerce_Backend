import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

  // Configuration
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
  });

  // Upload an image
  export const uploadImages = async (fileToUpLoad) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(fileToUpLoad, (error, result) => {
        if (error) return reject(error);
        resolve(
          {
            url: result.secure_url,
            public_id: result.public_id,
          },
          { resource_type: "auto" }
        );
      });
    });
  };
  // Optimize delivery by resizing and applying auto-format and auto-quality
  export const optimizeUrl = cloudinary.url("shoes", {
    fetch_format: "auto",
    quality: "auto",
  });

  console.log(optimizeUrl);

  // Transform the image: auto-crop to square aspect_ratio
  export const autoCropUrl = cloudinary.url("shoes", {
    crop: "auto",
    gravity: "auto",
    width: 500,
    height: 500,
  });

  console.log(autoCropUrl);

