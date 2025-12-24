import { NextFunction, Request, Response } from "express";
import TryCatch from "../../utils/Trycatch.js";
import ErrorHandler from "../../middlewares/ErrorHandler.js";
import Product from "../../models/productModel.js";
import Category from "../../models/categoryModel.js";

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

export const getCategoryProducts = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId } = req.params;

    // Step 1: Verify the category exists
    const category = await Category.findOne({
      _id: categoryId,
      isActive: { $ne: false },
    }).lean();

    if (!category) {
      return next(new ErrorHandler("Category not found", 404));
    }

    const categoryLevel = category.level;

    // Step 2: Handle based on category level
    // If level 2 (leaf category), return products directly
    if (categoryLevel === 2) {
      const products = await Product.find({
        categoryId: category._id,
        isActive: { $ne: false },
      })
        .sort({ createdAt: -1 })
        .limit(15)
        .select("_id name brand thumbnail variants")
        .lean();

      // Format products with only necessary variant fields
      const formattedProducts = products.map((product) => ({
        _id: product._id,
        name: product.name,
        brand: product.brand,
        thumbnail: product.thumbnail,
        variants: product.variants?.map((v: any) => ({
          _id: v._id,
          stock: v.stock,
          mrp: v.mrp,
          sellingPrices: v.sellingPrices,
        })),
      }));

      return res.status(200).json({
        success: true,
        level: categoryLevel,
        categoryId: category._id,
        categoryName: category.name,
        totalProducts: formattedProducts.length,
        products: formattedProducts,
      });
    }

    // If level 0 or 1, find subcategories and return products grouped by subcategory
    const subCategories = await Category.find({
      parent: categoryId,
      level: categoryLevel + 1,
      isActive: { $ne: false },
    }).lean();

    if (!subCategories || subCategories.length === 0) {
      return res.status(200).json({
        success: true,
        level: categoryLevel,
        categoryId: category._id,
        categoryName: category.name,
        message: "No subcategories found",
        data: [],
      });
    }

    // Step 3: For each subcategory, fetch 15 products
    const subCategoriesWithProducts = await Promise.all(
      subCategories.map(async (subCategory) => {
        // Find all descendant categories (the subcategory itself + its children)
        const descendantCategories = await Category.find({
          path: subCategory._id, // Categories whose path includes this subcategory
          isActive: { $ne: false },
        })
          .select("_id")
          .lean();

        // Build array of category IDs: subcategory + all its descendants
        const categoryIds = [
          subCategory._id,
          ...descendantCategories.map((cat) => cat._id),
        ];

        // Find products linked to any of these categories
        const products = await Product.find({
          categoryId: { $in: categoryIds },
          isActive: { $ne: false },
        })
          .sort({ createdAt: -1 })
          .limit(15) // 15 products per subcategory
          .select("_id name brand thumbnail variants")
          .lean();

        // Project only necessary variant fields
        const formattedProducts = products.map((product) => ({
          _id: product._id,
          name: product.name,
          brand: product.brand,
          thumbnail: product.thumbnail,
          variants: product.variants?.map((v: any) => ({
            _id: v._id,
            stock: v.stock,
            mrp: v.mrp,
            sellingPrices: v.sellingPrices,
          })),
        }));

        return {
          subCategoryId: subCategory._id,
          subCategoryName: subCategory.name,
          products: formattedProducts,
        };
      })
    );

    // Step 4: Filter out subcategories with no products
    const subCategoriesWithProductsFiltered = subCategoriesWithProducts.filter(
      (subCat) => subCat.products.length > 0
    );

    res.status(200).json({
      success: true,
      level: categoryLevel,
      categoryId: category._id,
      categoryName: category.name,
      totalSubCategories: subCategoriesWithProductsFiltered.length,
      data: subCategoriesWithProductsFiltered,
    });
  }
);

export const getLandingPageProducts = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    // Step 1: Fetch all active categories at level 0
    const level0Categories = await Category.find({
      parent: { $eq: null },
      isActive: { $ne: false },
    }).lean();
    // console.log(level0Categories)
    if (!level0Categories || level0Categories.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No categories found",
        data: [],
      });
    }

    // Step 2: For each category, fetch 10 products
    const categoriesWithProducts = await Promise.all(
      level0Categories.map(async (category) => {
        // Find all descendant categories (children at level 1 and 2)
        const descendantCategories = await Category.find({
          path: category._id, // Categories whose path includes this category
          isActive: { $ne: false },
        })
          .select("_id")
          .lean();

        // Build array of category IDs: parent + all descendants
        const categoryIds = [
          category._id,
          ...descendantCategories.map((cat) => cat._id),
        ];

        // Find products linked to any of these categories
        const products = await Product.find({
          categoryId: { $in: categoryIds }, // Fixed: was 'category', now 'categoryId'
          isActive: { $ne: false },
        })
          .sort({ createdAt: -1 })
          .limit(10)
          .select("_id name brand thumbnail variants")
          .lean();

        // Project only necessary variant fields
        const formattedProducts = products.map((product) => ({
          _id: product._id,
          name: product.name,
          brand: product.brand,
          thumbnail: product.thumbnail,
          variants: product.variants?.map((v: any) => ({
            _id: v._id,
            stock: v.stock,
            mrp: v.mrp,
            sellingPrices: v.sellingPrices,
          })),
        }));

        return {
          categoryId: category._id,
          categoryName: category.name,
          products: formattedProducts,
        };
      })
    );
    // Step 3: Filter out categories with no products
    const categoriesWithProductsFiltered = categoriesWithProducts.filter(
      (cat) => cat.products.length > 0
    );

    console.log(categoriesWithProductsFiltered);
    res.status(200).json({
      success: true,
      totalCategories: categoriesWithProductsFiltered.length,
      data: categoriesWithProductsFiltered,
    });
  }
);

export const getSimilarProducts = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId } = req.params;
    const { excludeProductId } = req.query;
    const limit = 10;

    // Step 1: Verify the category exists and is level 2 (sub-sub-category)
    const category = await Category.findOne({
      _id: categoryId,
      level: 2,
      isActive: { $ne: false },
    }).lean();

    if (!category) {
      return next(
        new ErrorHandler("Category not found or is not a sub-sub-category", 404)
      );
    }

    // Step 2: Build the query filter
    const filter: any = {
      categoryId,
      isActive: { $ne: false },
    };

    // Optionally exclude a specific product (useful when showing "similar products" on a product page)
    if (excludeProductId && typeof excludeProductId === "string") {
      filter._id = { $ne: excludeProductId };
    }

    // Step 3: Fetch similar products
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("_id name brand thumbnail variants")
      .lean();
    console.log(products, "siml called");
    // Step 4: Format products with only necessary variant fields
    const formattedProducts = products.map((product) => ({
      _id: product._id,
      name: product.name,
      brand: product.brand,
      thumbnail: product.thumbnail,
      variants: product.variants?.map((v: any) => ({
        _id: v._id,
        stock: v.stock,
        mrp: v.mrp,
        sellingPrices: v.sellingPrices,
      })),
    }));

    res.status(200).json({
      success: true,
      categoryId: category._id,
      categoryName: category.name,
      totalProducts: formattedProducts.length,
      products: formattedProducts,
    });
  }
);

export const searchProducts = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      q, // search query
      categoryId,
      subCategoryId,
      subSubCategoryId,
      brand,
      minPrice,
      maxPrice,
      inStock,
      sort = "relevance", // relevance, price_asc, price_desc, newest
      page = "1",
      limit = "20",
    } = req.query as {
      q?: string;
      categoryId?: string;
      subCategoryId?: string;
      subSubCategoryId?: string;
      brand?: string;
      minPrice?: string;
      maxPrice?: string;
      inStock?: string;
      sort?: string;
      page?: string;
      limit?: string;
    };
    console.log("Query Parameters:", req.query);
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 100); // max 100 items per page
    const skip = (pageNum - 1) * limitNum;
    console.log("Pagination:", { pageNum, limitNum, skip });

    // Build aggregation pipeline
    const pipeline: any[] = [];

    // Step 1: Initial match - must include $text search if present (MongoDB requirement)
    const initialMatch: any = {
      isActive: { $ne: false },
    };

    // Text search mode - MUST be in first $match stage
    const hasSearchQuery = typeof q === "string" && q.trim().length > 0;
    if (hasSearchQuery) {
      initialMatch.$text = { $search: q!.trim() };
    }

    pipeline.push({ $match: initialMatch });

    // Step 2: Add text search score if searching (must be right after $text match)
    if (hasSearchQuery) {
      pipeline.push({
        $addFields: {
          searchScore: { $meta: "textScore" },
        },
      });
    }

    // Step 3: Lookup category information
    pipeline.push({
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "_id",
        as: "categoryInfo",
      },
    });

    // Unwind category info (each product has one category)
    pipeline.push({
      $unwind: {
        path: "$categoryInfo",
        preserveNullAndEmptyArrays: true,
      },
    });

    // Step 4: Build additional match conditions (filters)
    const matchConditions: any = {};

    // Category filters (using lookup data)
    if (categoryId) {
      matchConditions["categoryInfo._id"] = categoryId;
      matchConditions["categoryInfo.level"] = 0;
    }

    if (subCategoryId) {
      // Find the subcategory and filter by its name
      const subCategory = await Category.findOne({
        _id: subCategoryId,
        level: 1,
        isActive: { $ne: false },
      }).lean();

      if (subCategory) {
        matchConditions["categoryInfo._id"] = subCategory._id;
      }
    }

    if (subSubCategoryId) {
      // Find the sub-subcategory and filter by its name
      const subSubCategory = await Category.findOne({
        _id: subSubCategoryId,
        level: 2,
        isActive: { $ne: false },
      }).lean();

      if (subSubCategory) {
        matchConditions["categoryInfo._id"] = subSubCategory._id;
      }
    }

    // Brand filter
    if (brand && brand.trim()) {
      const brands = brand
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean);
      if (brands.length === 1) {
        matchConditions.brand = new RegExp(`^${brands[0]}$`, "i");
      } else if (brands.length > 1) {
        matchConditions.brand = {
          $in: brands.map((b) => new RegExp(`^${b}$`, "i")),
        };
      }
    }

    // Stock filter
    if (inStock === "true") {
      matchConditions["variants"] = {
        $elemMatch: {
          stock: { $gt: 0 },
          isActive: { $ne: false },
        },
      };
    }

    // Price range filter
    const minP = minPrice && minPrice !== "" ? Number(minPrice) : undefined;
    const maxP = maxPrice && maxPrice !== "" ? Number(maxPrice) : undefined;

    if (
      (typeof minP === "number" && !Number.isNaN(minP)) ||
      (typeof maxP === "number" && !Number.isNaN(maxP))
    ) {
      const priceFilter: any = {};
      if (typeof minP === "number" && !Number.isNaN(minP)) {
        priceFilter.$gte = minP;
      }
      if (typeof maxP === "number" && !Number.isNaN(maxP)) {
        priceFilter.$lte = maxP;
      }

      matchConditions["variants.sellingPrices"] = {
        $elemMatch: { price: priceFilter },
      };
    }

    // Apply additional match conditions (filters)
    console.log("Match Conditions:", JSON.stringify(matchConditions, null, 2));
    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }

    // Step 5: Sorting
    let sortStage: any = {};
    switch (sort) {
      case "price_asc":
        sortStage = { "variants.sellingPrices.0.price": 1 };
        break;
      case "price_desc":
        sortStage = { "variants.sellingPrices.0.price": -1 };
        break;
      case "newest":
        sortStage = { createdAt: -1 };
        break;
      case "relevance":
      default:
        if (hasSearchQuery) {
          sortStage = { searchScore: -1, createdAt: -1 };
        } else {
          sortStage = { createdAt: -1 };
        }
        break;
    }
    pipeline.push({ $sort: sortStage });

    // Step 6: Facet for pagination and total count
    pipeline.push({
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limitNum },
          {
            $project: {
              _id: 1,
              name: 1,
              brand: 1,
              thumbnail: 1,
              categoryInfo: {
                _id: 1,
                name: 1,
                level: 1,
              },
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
              ...(hasSearchQuery && { searchScore: 1 }),
            },
          },
        ],
        totalCount: [{ $count: "count" }],
      },
    });

    // Execute aggregation
    console.log("Pipeline Stages:", pipeline.length);
    console.log("Full Pipeline:", JSON.stringify(pipeline, null, 2));
    const aggResult = await Product.aggregate(pipeline);
    const result = aggResult[0] || { data: [], totalCount: [] };

    const products = result.data || [];
    const totalProducts = result.totalCount[0]?.count || 0;
    const totalPages = Math.max(Math.ceil(totalProducts / limitNum), 1);
    console.log("Results:", {
      totalProducts,
      productsReturned: products.length,
    });

    res.status(200).json({
      success: true,
      searchQuery: q || null,
      filters: {
        categoryId: categoryId || null,
        subCategoryId: subCategoryId || null,
        subSubCategoryId: subSubCategoryId || null,
        brand: brand || null,
        priceRange:
          minP || maxP ? { min: minP || null, max: maxP || null } : null,
        inStock: inStock === "true",
      },
      sort,
      page: pageNum,
      limit: limitNum,
      totalProducts,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPreviousPage: pageNum > 1,
      products,
    });
  }
);

export const searchSuggestions = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { q } = req.query as { q?: string };

    // Validate query
    if (!q || q.trim().length < 2) {
      return res.status(200).json({
        success: true,
        message: "Query must be at least 2 characters",
        suggestions: {
          products: [],
          brands: [],
          categories: [],
        },
      });
    }

    const query = q.trim();
    const limit = 5; // Limit suggestions per category

    // Create case-insensitive regex for prefix matching
    // Using ^ anchor for better performance (uses index efficiently)
    const prefixRegex = new RegExp(
      `^${query.replace(/[.*+?^${}()|[\]\\]/g, "\\\\$&")}`,
      "i"
    );

    // Also create a word-boundary regex for broader matches
    const wordRegex = new RegExp(
      `\\b${query.replace(/[.*+?^${}()|[\]\\]/g, "\\\\$&")}`,
      "i"
    );

    try {
      // Run all queries in parallel for speed
      const [productSuggestions, brandSuggestions, categorySuggestions] =
        await Promise.all([
          // Product name suggestions
          Product.find({
            isActive: { $ne: false },
            $or: [
              { name: prefixRegex },
              { name: wordRegex },
              { tags: prefixRegex },
            ],
          })
            .select("name _id thumbnail")
            .sort({ name: 1 })
            .limit(limit)
            .lean(),

          // Brand suggestions (distinct brands matching query)
          Product.aggregate([
            {
              $match: {
                isActive: { $ne: false },
                brand: prefixRegex,
              },
            },
            {
              $group: {
                _id: "$brand",
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
            { $limit: limit },
            {
              $project: {
                _id: 0,
                name: "$_id",
                count: 1,
              },
            },
          ]),

          // Category suggestions (from Category model)
          Category.find({
            isActive: { $ne: false },
            name: prefixRegex,
          })
            .select("name _id level")
            .sort({ level: 1, name: 1 })
            .limit(limit)
            .lean(),
        ]);

      // Format response
      const suggestions = {
        products: productSuggestions.map((p) => ({
          id: p._id,
          name: p.name,
          thumbnail: p.thumbnail?.url || null,
          type: "product",
        })),
        brands: brandSuggestions.map((b) => ({
          name: b.name,
          productCount: b.count,
          type: "brand",
        })),
        categories: categorySuggestions.map((c) => ({
          id: c._id,
          name: c.name,
          level: c.level,
          type: "category",
        })),
      };

      // Calculate total suggestions
      const totalSuggestions =
        suggestions.products.length +
        suggestions.brands.length +
        suggestions.categories.length;

      res.status(200).json({
        success: true,
        query,
        totalSuggestions,
        suggestions,
      });
    } catch (error) {
      return next(new ErrorHandler("Error fetching suggestions", 500));
    }
  }
);
