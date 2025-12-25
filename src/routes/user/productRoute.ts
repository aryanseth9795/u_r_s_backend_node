import express from "express";
import {
  getProductByID,
  getLandingPageProducts,
  getCategoryProducts,
  getSimilarProducts,
  searchProducts,
  searchSuggestions,
  getFilteredLandingProducts,
} from "../../controllers/user/productController.js";

const router = express.Router();

// Filtered landing page products (20 from each level 0 category based on filter)
router.get("/landing/filtered", getFilteredLandingProducts);

// Landing page products (10 from each level 0 category)
router.get("/landing", getLandingPageProducts);

// Category-specific products with pagination
router.get("/category/:categoryId", getCategoryProducts);

// Similar products based on level 2 category
router.get("/similar/:categoryId", getSimilarProducts);

// Product search with filters and sorting
router.get("/search", searchProducts);

// Search suggestions (autocomplete)
router.get("/search/suggestions", searchSuggestions);

// Single product details
router.get("/:id", getProductByID);

export default router;
