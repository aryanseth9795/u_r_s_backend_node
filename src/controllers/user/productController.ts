import { NextFunction, Request,  Response } from "express";
import TryCatch from "../../utils/Trycatch.js";
import ErrorHandler from "../../middlewares/ErrorHandler.js";
import Product from "../../models/productModel.js";

export const getProductByID = TryCatch(
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


export const getProductListUser=TryCatch(async(req:Request,res:Response,next:NextFunction)=>{

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



})