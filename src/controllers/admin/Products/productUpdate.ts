import TryCatch from "../../../utils/Trycatch.js";
import Product from "../../../models/productModel.js";
import Category from "../../../models/categoryModel.js";
import ErrorHandler from "../../../middlewares/ErrorHandler.js";
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cloudinary from "../../../utils/cloudinary.js";
import { ProcessedImage } from "../../../middlewares/uploadProductImages.js";

// Type definitions
interface CloudinaryImage {
  publicId: string;
  url: string;
  secureUrl: string;
  folder?: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
}

type ReqWithImgs = Request & {
  productImages?: {
    thumbnail?: ProcessedImage;
    variantImages?: Record<number, ProcessedImage[]>;
  };
};

interface DeletedImage {
  publicId: string;
  url: string;
  type: "thumbnail" | "variant";
  variantIndex?: number;
}

// ---------- Helper Functions ----------

/**
 * Upload a single image buffer to Cloudinary
 */
const uploadImageBufferToCloudinary = async (
  file: ProcessedImage,
  options: { folder: string }
): Promise<CloudinaryImage> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        resource_type: "image",
      },
      (error: any, result: any) => {
        if (error || !result) {
          return reject(
            new Error("Cloudinary upload failed: " + (error?.message || ""))
          );
        }

        const img: CloudinaryImage = {
          publicId: result.public_id,
          url: result.url,
          secureUrl: result.secure_url,
          folder: result.folder,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
        };

        resolve(img);
      }
    );

    uploadStream.end(file.buffer);
  });
};

/**
 * Upload multiple image buffers to Cloudinary
 */
const uploadManyImageBuffersToCloudinary = async (
  files: ProcessedImage[],
  options: { folder: string }
): Promise<CloudinaryImage[]> => {
  if (!files || !files.length) return [];
  return Promise.all(
    files.map((file) => uploadImageBufferToCloudinary(file, options))
  );
};

/**
 * Delete multiple images from Cloudinary by publicId
 */
const deleteImagesFromCloudinary = async (
  publicIds: string[]
): Promise<void> => {
  if (!publicIds || publicIds.length === 0) return;

  try {
    // Cloudinary allows batch deletion
    const result = await cloudinary.api.delete_resources(publicIds);
    console.log(`Deleted ${publicIds.length} images from Cloudinary:`, result);
  } catch (error: any) {
    console.error("Error deleting images from Cloudinary:", error);
    // Don't throw - we still want the update to succeed even if cloudinary cleanup fails
  }
};

// ---------- Stock Update Function (Existing) ----------

export const updateStock = TryCatch(
  async (req: Request, Res: Response, next: NextFunction) => {
    const { productId, variantId, stock } = req.body;

    const result = await Product.findById(productId);

    if (!result) {
      return next(new ErrorHandler("Product Not Found with this ID", 404));
    }

    result?.variants?.forEach((variant) => {
      if (variant._id.toString() === variantId) {
        variant.stock += stock;
      }
    });

    result.save();

    Res.status(200).json({
      success: true,
      message: `Stock added by ${stock}`,
    });
  }
);

// ---------- Product Update Function ----------

export const updateProduct = TryCatch(
  async (req: ReqWithImgs, res: Response, next: NextFunction) => {

    console.log(req.body,"hitttt");
    // 1) Parse JSON payload from "data"
    if (!req.body?.data) {
      next(new ErrorHandler("Missing product payload (data)", 400));
      return;
    }

    let payload: any;
    try {
      payload = JSON.parse(req.body.data);
    } catch {
      next(new ErrorHandler("Invalid JSON in data field", 400));
      return;
    }
console.log(payload,"payload"); 
    const {
      productId,
      name,
      brand,
      slug,
      categoryId,
      tags,
      description,
      deliveryOption,
      variants,
      isActive,
      deletedImages, // Array of { publicId, url, type, variantIndex? }
    } = payload || {};

    // 2) Validate productId
    if (!productId) {
      next(new ErrorHandler("productId is required", 400));
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      next(new ErrorHandler("Invalid productId", 400));
      return;
    }

    // 3) Fetch existing product
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      next(new ErrorHandler("Product not found", 404));
      return;
    }

    // 4) Validate required fields (if provided)
    if (name !== undefined && !name) {
      next(new ErrorHandler("name cannot be empty", 400));
      return;
    }

    if (slug !== undefined && !slug) {
      next(new ErrorHandler("slug cannot be empty", 400));
      return;
    }

    if (brand !== undefined && !brand) {
      next(new ErrorHandler("brand cannot be empty", 400));
      return;
    }

    // 5) Validate and fetch category if being updated
    if (categoryId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(String(categoryId))) {
        next(new ErrorHandler("Invalid categoryId", 400));
        return;
      }

      const cat = await Category.findOne({ _id: categoryId, isActive: true })
        .select("_id level")
        .lean();

      if (!cat) {
        next(new ErrorHandler("Category not found or inactive", 404));
        return;
      }
    }

    // 6) Validate variants if being updated
    if (variants !== undefined) {
      if (!Array.isArray(variants) || variants.length === 0) {
        next(new ErrorHandler("At least one variant is required", 400));
        return;
      }
    }

    // 7) Handle image deletions and uploads
    const publicIdsToDelete: string[] = [];
    let newThumbnail: CloudinaryImage | null = null;

    // Parse deletedImages
    const deletedImagesArray: DeletedImage[] = Array.isArray(deletedImages)
      ? deletedImages
      : [];

    // Handle thumbnail update
    const productImages = req.productImages;
    const thumbnailToDelete = deletedImagesArray.find(
      (img) => img.type === "thumbnail"
    );

    if (productImages?.thumbnail) {
      // New thumbnail provided - upload it
      newThumbnail = await uploadImageBufferToCloudinary(
        productImages.thumbnail,
        { folder: "urs/thumbnails" }
      );

      // Mark old thumbnail for deletion
      if (existingProduct.thumbnail?.publicId) {
        publicIdsToDelete.push(existingProduct.thumbnail.publicId);
      }
    } else if (thumbnailToDelete) {
      // Thumbnail marked for deletion but no new one provided - error
      next(
        new ErrorHandler(
          "Cannot delete thumbnail without providing a replacement",
          400
        )
      );
      return;
    }

    // 8) Handle variant images updates
    const variantImagesCloud: Record<number, CloudinaryImage[]> = {};

    if (productImages?.variantImages) {
      const entries = Object.entries(productImages.variantImages);
      for (const [idxStr, files] of entries) {
        const idx = Number(idxStr);
        const cloudImgs = await uploadManyImageBuffersToCloudinary(files, {
          folder: "urs/products",
        });
        variantImagesCloud[idx] = cloudImgs;
      }
    }

    // 9) Build updated variants array
    let variantsForDb: any[] | null = null;

    if (variants !== undefined) {
      variantsForDb = variants.map((v: any, index: number) => {
        // Start with existing variant images if this variant existed before
        let existingImages: any[] = [];
        if (
          existingProduct.variants &&
          existingProduct.variants[index]?.images
        ) {
          existingImages = existingProduct.variants[index].images;
        }

        // Filter out deleted images for this variant
        const deletedForThisVariant = deletedImagesArray.filter(
          (img) => img.type === "variant" && img.variantIndex === index
        );

        const deletedPublicIds = deletedForThisVariant.map(
          (img) => img.publicId
        );
        publicIdsToDelete.push(...deletedPublicIds);

        const filteredExistingImages = existingImages.filter(
          (img: any) => !deletedPublicIds.includes(img.publicId)
        );

        // Add new uploaded images for this variant
        const newImages = variantImagesCloud[index] || [];

        // Merge: existing (minus deleted) + new uploads
        const mergedImages = [
          ...filteredExistingImages,
          ...newImages.map((img) => ({
            publicId: img.publicId,
            url: img.url,
            secureUrl: img.secureUrl,
            folder: img.folder,
            format: img.format,
            width: img.width,
            height: img.height,
            bytes: img.bytes,
          })),
        ];

        return {
          packOf: Number(v.packOf || 1),
          measurement: v.measurement || undefined,
          expiry: v.expiry ? new Date(v.expiry) : null,
          mrp: Number(v.mrp || 0),
          stock: Number(v.stock || 0),
          isActive: v.isActive ?? true,
          images: mergedImages,
          sellingPrices: Array.isArray(v.sellingPrices)
            ? v.sellingPrices.map((p: any) => ({
                minQuantity: Number(p.minQuantity || 1),
                price: Number(p.price || 0),
                discount: Number(p.discount || 0),
              }))
            : [],
        };
      });

      // Validate each variant has at least one selling price
      if (variantsForDb !== null) {
        for (const v of variantsForDb) {
          if (!Array.isArray(v.sellingPrices) || v.sellingPrices.length === 0) {
            next(
              new ErrorHandler(
                "Each variant must have at least one selling price tier",
                400
              )
            );
            return;
          }
        }
      }
    }

    // 10) Process tags
    let tagsArr: string[] | undefined = undefined;
    if (tags !== undefined) {
      tagsArr = Array.isArray(tags)
        ? tags
        : typeof tags === "string"
        ? tags
            .split(",")
            .map((t: string) => t.trim())
            .filter(Boolean)
        : [];
      tagsArr = [...new Set(tagsArr)]; // Remove duplicates
    }

    // 11) Build update object (only include fields that are being updated)
    const updateFields: any = {};

    if (name !== undefined) updateFields.name = String(name).trim();
    if (slug !== undefined)
      updateFields.slug = String(slug).trim().toLowerCase();
    if (brand !== undefined) updateFields.brand = String(brand).trim();
    if (categoryId !== undefined) updateFields.categoryId = categoryId;
    if (tagsArr !== undefined) updateFields.tags = tagsArr;
    if (description !== undefined) updateFields.description = description || "";
    if (deliveryOption !== undefined) {
      updateFields.deliveryOption = {
        isCancel: !!deliveryOption.isCancel,
        isReturnable: !!deliveryOption.isReturnable,
        isWarranty: !!deliveryOption.isWarranty,
      };
    }
    if (newThumbnail !== null) {
      updateFields.thumbnail = {
        publicId: newThumbnail.publicId,
        url: newThumbnail.url,
        secureUrl: newThumbnail.secureUrl,
        folder: newThumbnail.folder,
        format: newThumbnail.format,
        width: newThumbnail.width,
        height: newThumbnail.height,
        bytes: newThumbnail.bytes,
      };
    }
    if (variantsForDb !== null) updateFields.variants = variantsForDb;
    if (isActive !== undefined) updateFields.isActive = isActive;

    // 12) Delete old images from Cloudinary
    if (publicIdsToDelete.length > 0) {
      await deleteImagesFromCloudinary(publicIdsToDelete);
    }

    // 13) Update product in database
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      next(new ErrorHandler("Failed to update product", 500));
      return;
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  }
);
