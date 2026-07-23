import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; // Node.js built-in File System module

// 1. Configure Cloudinary with your account credentials
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// 2. Create the upload function
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto" // Automatically detects if it's an image, video, or raw file
        });

        // File has been uploaded successfully
         console.log("File is uploaded on Cloudinary: ", response.url);
        
        // Remove the locally saved temporary file now that it is safely in the cloud
        fs.unlinkSync(localFilePath);

        return response; // We return the response because we need the response.url in our controllers

    } catch (error) {
        // If the upload fails, we MUST delete the local file from our server to prevent malicious/broken files from piling up
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return null;
    }
}

export { uploadOnCloudinary };