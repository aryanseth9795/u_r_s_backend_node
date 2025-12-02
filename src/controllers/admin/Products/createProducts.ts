import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../../../middlewares/ErrorHandler.js";
import cloudinary from "../../../utils/cloudinary.js";
import TryCatch from "../../../utils/Trycatch.js";
import { ProcessedImage } from "../../../middlewares/uploadProductImages.js";
import Product from "../../../models/productModel.js";

export const getAllProductsAdmin = TryCatch(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = 20;
    const skip = (page - 1) * limit;
    const {
      search,
      category,
      subCategory,
      subSubCategory,
      brand,
      tags,
      minPrice,
      maxPrice,
      inStock,
    } = req.query as {
      search?: string;
      category?: string;
      subCategory?: string;
      subSubCategory?: string;
      brand?: string;
      tags?: string;
      minPrice?: string;
      maxPrice?: string;
      inStock?: string;
    };
 console.log("called proo")
    // -------- BASE MATCH (only active products) --------
    const match: any = {
      isActive: { $ne: false }, // true or undefined
    };

    // -------- SEARCH MODE (search OR filters) --------
    const hasSearch = typeof search === "string" && search.trim().length > 0;

    if (hasSearch) {
      // partial, case-insensitive search on brand/category/subcategory/keywords/name
      const safe = search!.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(safe, "i");

      match.$or = [
        { brand: regex }, // brand name
        { category: regex }, // main category (beauty, cosmetics, etc.)
        { subCategory: regex }, // sub category
        { subSubCategory: regex }, // sub-sub category
        { tags: regex }, // keywords array
        { name: regex }, // product name (extra nice UX)
      ];
    } else {
      // -------- FILTER MODE (only when NO search) --------

      if (category) match.category = category;
      if (subCategory) match.subCategory = subCategory;
      if (subSubCategory) match.subSubCategory = subSubCategory;

      if (brand) {
        const brands = brand
          .split(",")
          .map((b) => b.trim())
          .filter(Boolean);
        if (brands.length) match.brand = { $in: brands };
      }

      if (tags) {
        const tagsArr = tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
        if (tagsArr.length) match.tags = { $in: tagsArr };
      }

      if (inStock === "true") {
        match["variants.stock"] = { $gt: 0 };
      }

      const priceFilter: any = {};
      const minP = minPrice && minPrice !== "" ? Number(minPrice) : undefined;
      const maxP = maxPrice && maxPrice !== "" ? Number(maxPrice) : undefined;

      if (typeof minP === "number" && !Number.isNaN(minP)) {
        priceFilter.$gte = minP;
      }
      if (typeof maxP === "number" && !Number.isNaN(maxP)) {
        priceFilter.$lte = maxP;
      }

      if (Object.keys(priceFilter).length > 0) {
        match["variants.sellingPrices"] = {
          $elemMatch: { price: priceFilter },
        };
      }
    }

    // -------- AGGREGATION PIPELINE --------
    const pipeline: any[] = [
      { $match: match },
      { $sort: { createdAt: -1 } }, // latest first
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                name: 1,
                brand: 1,
                thumbnail: 1,
                variants: {
                  $map: {
                    input: "$variants",
                    as: "v",
                    in: {
                      _id: "$$v._id",
                      stock: "$$v.stock",
                      mrp: "$$v.mrp",
                      sellingPrices: "$$v.sellingPrices",
                    },
                  },
                },
              },
            },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const aggResult = await Product.aggregate(pipeline);
    const result = aggResult[0] || { data: [], totalCount: [] };

    const products = result.data || [];
    const totalProducts = result.totalCount[0]?.count || 0;
    const totalPages = Math.max(Math.ceil(totalProducts / limit), 1);

    res.status(200).json({
      success: true,
      page,
      limit,
      totalProducts,
      totalPages,
      hasNextPage: page < totalPages,
      products, // [{ _id, name, brand, thumbnail, variants:[{ _id, stock, mrp, sellingPrices }] }]
    });
  }
);

export const getProductAdminById = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req?.params?.id;

    const product = await Product.findById(id).lean();
    if (!product) {
      next(new ErrorHandler("No Product Found", 404));
    }
    res.status(200).json({
      success: true,
      product,
    });
  }
);
//Admin Product creation

// must match IImage in your Product schema
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

// ---------- Cloudinary helpers (buffer → IImage) ----------

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
          console.error("Cloudinary upload error:", error);
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

const uploadManyImageBuffersToCloudinary = async (
  files: ProcessedImage[],
  options: { folder: string }
): Promise<CloudinaryImage[]> => {
  if (!files || !files.length) return [];
  return Promise.all(
    files.map((file) => uploadImageBufferToCloudinary(file, options))
  );
};

// ---------- Controller ----------

export const createProductAdmin = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Parse JSON payload from "data"
    if (!req.body?.data) {
      return next(new ErrorHandler("Missing product payload (data)", 400));
    }

    let payload: any;
    try {
      payload = JSON.parse(req.body.data);
    } catch (err) {
      console.error("Invalid JSON in data:", err);
      return next(new ErrorHandler("Invalid JSON in data field", 400));
    }

    const {
      name,
      brand,
      slug,
      category,
      subCategory,
      subSubCategory,
      tags,
      description,
      deliveryOption,
      variants,
      isActive,
    } = payload || {};

    if (!name || !slug || !category || !deliveryOption || !brand) {
      return next(
        new ErrorHandler(
          "name, slug, category and deliveryOption are required",
          400
        )
      );
    }

    if (!Array.isArray(variants) || variants.length === 0) {
      return next(new ErrorHandler("At least one variant is required", 400));
    }

    const productImages = req.productImages;

    // 2) Thumbnail must exist (multer or optional base64 in middleware)
    if (!productImages?.thumbnail) {
      return next(
        new ErrorHandler(
          "Thumbnail image is required. Please upload a thumbnail.",
          400
        )
      );
    }

    // 3) Upload thumbnail to Cloudinary
    const thumbnailCloud = await uploadImageBufferToCloudinary(
      productImages.thumbnail,
      { folder: "urs/thumbnails" }
    );

    // 4) Upload per-variant images to Cloudinary
    // productImages.variantImages: { [variantIndex: number]: ProcessedImage[] }
    const variantImagesCloud: Record<number, CloudinaryImage[]> = {};

    if (productImages.variantImages) {
      const entries = Object.entries(productImages.variantImages); // [ "0", [ProcessedImage,...] ]

      for (const [idxStr, files] of entries) {
        const idx = Number(idxStr);
        const cloudImgs = await uploadManyImageBuffersToCloudinary(files, {
          folder: "urs/products",
        });
        variantImagesCloud[idx] = cloudImgs;
      }
    }

    // 5) Build final variants array with images attached
    const variantsForDb = variants.map((v: any, index: number) => {
      const cloudImgs = variantImagesCloud[index] || [];

      // v.measurement is already in shape { value?, unit?, label? } from frontend
      return {
        packOf: Number(v.packOf || 0),
        measurement: v.measurement || undefined,
        mrp: Number(v.mrp || 0),
        stock: Number(v.stock || 0),
        isActive: v.isActive ?? true,
        images: cloudImgs.map((img) => ({
          publicId: img.publicId,
          url: img.url,
          secureUrl: img.secureUrl,
          folder: img.folder,
          format: img.format,
          width: img.width,
          height: img.height,
          bytes: img.bytes,
        })),
        sellingPrices: Array.isArray(v.sellingPrices)
          ? v.sellingPrices.map((p: any) => ({
              minQuantity: Number(p.minQuantity || 1),
              price: Number(p.price || 0),
              discount: Number(p.discount || 0),
            }))
          : [],
      };
    });

    // 6) Prepare product document for Mongo
    const productDoc = {
      name: String(name).trim(),
      slug: String(slug).trim(),
      brand: String(brand).trim(),
      category,
      subCategory: subCategory || undefined,
      subSubCategory: subSubCategory || undefined,
      tags: Array.isArray(tags)
        ? tags
        : typeof tags === "string"
        ? tags
            .split(",")
            .map((t: string) => t.trim())
            .filter(Boolean)
        : [],
      description: description || "",
      deliveryOption: {
        isCancel: !!deliveryOption.isCancel,
        isReturnable: !!deliveryOption.isReturnable,
        isWarranty: !!deliveryOption.isWarranty,
      },
      thumbnail: {
        publicId: thumbnailCloud.publicId,
        url: thumbnailCloud.url,
        secureUrl: thumbnailCloud.secureUrl,
        folder: thumbnailCloud.folder,
        format: thumbnailCloud.format,
        width: thumbnailCloud.width,
        height: thumbnailCloud.height,
        bytes: thumbnailCloud.bytes,
      },
      variants: variantsForDb,
      isActive: isActive ?? true,
    };

    // 7) Save to DB
    try {
      const product = await Product.create(productDoc);
      res.status(201).json({
        success: true,
        message: "Product created",
        product,
      });
      console.log("khtm");
    } catch (error) {
      console.log(error);
    }
  }
);
