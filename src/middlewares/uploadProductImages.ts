// src/middlewares/uploadProductImages.ts
import { Request, Response, NextFunction } from "express";
import multer from "multer";
import sharp from "sharp";
import ErrorHandler from "../middlewares/ErrorHandler.js";

const MAX_THUMBNAIL_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_IMAGE_SIZE = 80 * 1024 * 1024; // 80 MB (per image)
const MAX_IMAGE_COUNT = 8; // total variant images (all variants combined)

const storage = multer.memoryStorage();

// we use .any() because field names are dynamic: variantImages[0], variantImages[1], ...
const multerUpload = multer({
  storage,
  fileFilter: (req, file, cb: any) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new ErrorHandler("Only image files are allowed", 400), false);
    }
    cb(null, true);
  },
}).any();

export interface ProcessedImage {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
  size: number;
}

declare global {
  namespace Express {
    interface Request {
      productImages?: {
        thumbnail?: ProcessedImage;
        /** per-variant images: key = variant index (0,1,2,...) */
        variantImages: Record<number, ProcessedImage[]>;
      };
    }
  }
}

/**
 * Accepts either "data:image/png;base64,..." or plain base64.
 * (Used only for optional thumbnailBase64)
 */
function parseBase64Image(input: string): { buffer: Buffer; mimeType: string } {
  const matches = input.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/);
  if (matches) {
    return {
      mimeType: matches[1],
      buffer: Buffer.from(matches[2], "base64"),
    };
  }
  // Fallback: assume jpeg if no prefix
  return {
    mimeType: "image/jpeg",
    buffer: Buffer.from(input, "base64"),
  };
}

/**
 * High-quality compression for ecommerce.
 */
export async function compressImageBuffer(
  buffer: Buffer,
  mimeType: string
): Promise<{ buffer: Buffer; mimeType: string }> {
  let pipeline = sharp(buffer).rotate(); // auto-orient

  if (mimeType === "image/png") {
    pipeline = pipeline.png({
      compressionLevel: 9,
      adaptiveFiltering: true,
      palette: true,
    });
    mimeType = "image/png";
  } else if (mimeType === "image/webp") {
    pipeline = pipeline.webp({
      quality: 85,
      effort: 4,
    });
    mimeType = "image/webp";
  } else if (mimeType === "image/avif") {
    pipeline = pipeline.avif({
      quality: 70,
    });
    mimeType = "image/avif";
  } else {
    // default: jpeg / jpg / others → jpeg
    pipeline = pipeline.jpeg({
      quality: 85,
      mozjpeg: true,
    });
    mimeType = "image/jpeg";
  }

  const out = await pipeline.toBuffer();
  return { buffer: out, mimeType };
}

const uploadProductImages = (req: Request, res: Response, next: NextFunction) => {
  multerUpload(req, res, (err: any) => {
    if (err) {
      console.log("error ayya hai:",err)
      return next(new ErrorHandler(err.message || "File upload failed", 400));
    }
console.log("yha tk call hua multer me ")
    const files = (req.files as Express.Multer.File[]) || [];

    const result: {
      thumbnail?: ProcessedImage;
      variantImages: Record<number, ProcessedImage[]>;
    } = {
      variantImages: {},
    };

    let totalVariantImages = 0;

    // 1) Handle multipart files: thumbnail + variantImages[<index>]
    for (const f of files) {
      // thumbnail
      if (f.fieldname === "thumbnail") {
        if (f.size > MAX_THUMBNAIL_SIZE) {
          return next(new ErrorHandler("Thumbnail must be ≤ 10MB", 400));
        }

        result.thumbnail = {
          buffer: f.buffer,
          mimeType: f.mimetype,
          originalName: f.originalname,
          size: f.size,
        };
        continue;
      }

      // variantImages[0], variantImages[1], ...
      const match = f.fieldname.match(/^variantImages\[(\d+)\]$/);
      if (match) {
        if (totalVariantImages >= MAX_IMAGE_COUNT) {
          return next(
            new ErrorHandler(
              `Maximum ${MAX_IMAGE_COUNT} variant images allowed`,
              400
            )
          );
        }

        if (f.size > MAX_IMAGE_SIZE) {
          return next(
            new ErrorHandler("Each variant image must be ≤ 80MB", 400)
          );
        }

        const idx = parseInt(match[1], 10);
        const img: ProcessedImage = {
          buffer: f.buffer,
          mimeType: f.mimetype,
          originalName: f.originalname,
          size: f.size,
        };

        if (!result.variantImages[idx]) {
          result.variantImages[idx] = [];
        }
        result.variantImages[idx].push(img);
        totalVariantImages += 1;

        continue;
      }

      // any other file field is ignored (no generic "images" anymore)
      console.warn("Unknown image field received:", f.fieldname);
    }

    // 2) Optional: thumbnail from base64 if not provided as file
    if (!result.thumbnail && req.body.thumbnailBase64) {
      const { buffer, mimeType } = parseBase64Image(req.body.thumbnailBase64);
      if (buffer.length > MAX_THUMBNAIL_SIZE) {
        return next(new ErrorHandler("Thumbnail must be ≤ 10MB", 400));
      }
      result.thumbnail = {
        buffer,
        mimeType,
        originalName: "thumbnail-from-base64",
        size: buffer.length,
      };
    }

    // 3) Compress everything and attach to req
    (async () => {
      try {
        if (result.thumbnail) {
          const c = await compressImageBuffer(
            result.thumbnail.buffer,
            result.thumbnail.mimeType
          );
          result.thumbnail.buffer = c.buffer;
          result.thumbnail.mimeType = c.mimeType;
          result.thumbnail.size = c.buffer.length;
        }

        // compress all variant images
        const variantIndices = Object.keys(result.variantImages).map((k) =>
          parseInt(k, 10)
        );

        await Promise.all(
          variantIndices.flatMap((idx) =>
            result.variantImages[idx].map(async (img) => {
              const c = await compressImageBuffer(img.buffer, img.mimeType);
              img.buffer = c.buffer;
              img.mimeType = c.mimeType;
              img.size = c.buffer.length;
            })
          )
        );
console.log(result)
        req.productImages = result;
        return next();
      } catch (e) {
        console.error("Image compression failed:", e);
        return next(
          
          new ErrorHandler("Failed to process images. Please try again.", 500)
        );
      }
    })();
  });
};

export default uploadProductImages;
