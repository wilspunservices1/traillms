import { cloudinary } from "@/libs/uploadinary/cloudinary"; // Adjust the path to your Cloudinary config
import { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";

type UploadResponse =
  { success: true; result: UploadApiResponse } |
  { success: false; error: UploadApiErrorResponse };

const uploadToCloudinary = (
  fileUri: string, fileName: string): Promise<UploadResponse> => {
  return new Promise((resolve) => {
    cloudinary.uploader
      .upload(fileUri, {
        invalidate: true,
        resource_type: "auto",
        filename_override: fileName,
        folder: "courses", // specify your folder
        use_filename: true,
      })
      .then((result) => {
        resolve({ success: true, result });
      })
      .catch((error) => {
        resolve({ success: false, error });
      });
  });
};

export { uploadToCloudinary };
