// routes/category.routes.ts
import { Router } from "express";
import {
  getCategories,
  getSubCategories,
  getSubSubCategories,
  createCategory,
  createSubCategory,
  createSubSubCategory,
} from "../../controllers/admin/Products/categoryProducts.js";
const rt = Router();

rt.get("/categories", getCategories);
rt.get("/categories/:categoryId/sub", getSubCategories);
rt.get("/subcategories/:subCategoryId/sub", getSubSubCategories);

rt.post("/categories", createCategory);
rt.post("/categories/:categoryId/sub", createSubCategory);
rt.post("/subcategories/:subCategoryId/sub", createSubSubCategory);

export default rt;

