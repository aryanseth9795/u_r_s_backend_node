// // src/utils/cloudinaryUpload.ts
// import cloudinary from "./cloudinary.js";
// import { ProcessedImage } from "../middlewares/uploadProductImages.js";
// import { CloudinaryImage } from "../models/productModel.js";

// // export interface CloudinaryImage {
// //   publicId: string;
// //   url: string;
// //   secureUrl: string;
// //   folder?: string;
// //   format?: string;
// //   width?: number;
// //   height?: number;
// //   bytes?: number;
// // }

// interface UploadOptions {
//   folder?: string;
//   publicId?: string;
//   tags?: string[];
// }

// export async function uploadImageBufferToCloudinary(
//   img: ProcessedImage,
//   options: UploadOptions = {}
// ): Promise<CloudinaryImage> {
//   // Convert buffer to base64 data URL
//   const base64 = `data:${img.mimeType};base64,${img.buffer.toString("base64")}`;

//   const result = await cloudinary.uploader.upload(base64, {
//     folder: options.folder,
//     public_id: options.publicId,
//     resource_type: "image",
//     overwrite: true,
//     invalidate: true,
//     tags: options.tags,
//   });

//   return {
//     publicId: result.public_id,
//     url: result.url,
//     secureUrl: result.secure_url,
//     folder: result.folder,
//     format: result.format,
//     width: result.width ?? undefined,
//     height: result.height ?? undefined,
//     bytes: result.bytes ?? undefined,
//   };
// }


// export async function uploadManyImageBuffersToCloudinary(
//   images: ProcessedImage[],
//   options: UploadOptions = {}
// ): Promise<CloudinaryImage[]> {
//   const uploads = images.map((img, idx) =>
//     uploadImageBufferToCloudinary(img, {
//       ...options,
//       publicId: options.publicId
//         ? `${options.publicId}-${idx}`
//         : undefined,
//     })
//   );
//   return Promise.all(uploads);
// }
