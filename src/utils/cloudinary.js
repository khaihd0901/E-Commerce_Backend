import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

  // Configuration
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Upload an image
  export const uploadImages = async (fileToUpLoad) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(fileToUpLoad, (error, result) => {
        if (error) return reject(error);
        resolve(
          {
            url: result.secure_url,
            asset_id: result.asset_id,  
            public_id: result.public_id,
          },
          { resource_type: "auto" }
        );
      });
    });
  };

  // Delete an image
  export const deleteImage = async (public_id) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(public_id, (error, result) => {
        if (error) return reject(error);
        resolve(
          {
            url: result.secure_url,
            asset_id: result.asset_id,  
            public_id: result.public_id,
          },
          { resource_type: "auto" }
        );
      });
    });
  };

