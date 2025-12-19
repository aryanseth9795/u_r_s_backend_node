// controllers/category.controller.ts
import { RequestHandler } from "express";
import mongoose, { Types } from "mongoose";
import Category from "../../../models/categoryModel.js";

const okId = (id: string) => mongoose.Types.ObjectId.isValid(id);
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

async function findDup(name: string, parent: Types.ObjectId | null, level: 0 | 1 | 2) {
  const nm = name.trim();
  return Category.findOne({
    parent: parent ?? null,
    level,
    name: { $regex: `^${esc(nm)}$`, $options: "i" },
  }).lean();
}

// -------- FETCH --------
export const getCategories: RequestHandler = async (req, res) => {
  const ac = req.query.active !== "0";
  const q: any = { level: 0, ...(ac ? { isActive: true } : {}) };

  console.log("getCategories query:", q);
  const ls = await Category.find(q)
    .select("name parent level path isActive")
    .sort({ name: 1 })
    .lean();
 console.log("getCategories result count:", ls.length);
  res.json({ data: ls });
};

export const getSubCategories: RequestHandler = async (req, res) => {
  const { categoryId } = req.params;
  if (!okId(categoryId)) {
    res.status(400).json({ message: "Invalid categoryId" });
    return;
  }

  const ac = req.query.active !== "0";
  const q: any = { level: 1, parent: categoryId, ...(ac ? { isActive: true } : {}) };

  const ls = await Category.find(q)
    .select("name parent level path isActive")
    .sort({ name: 1 })
    .lean();

  res.json({ data: ls });
};

export const getSubSubCategories: RequestHandler = async (req, res) => {
  const { subCategoryId } = req.params;
  if (!okId(subCategoryId)) {
    res.status(400).json({ message: "Invalid subCategoryId" });
    return;
  }

  const ac = req.query.active !== "0";
  const q: any = { level: 2, parent: subCategoryId, ...(ac ? { isActive: true } : {}) };

  const ls = await Category.find(q)
    .select("name parent level path isActive")
    .sort({ name: 1 })
    .lean();

  res.json({ data: ls });
};

// -------- CREATE --------
export const createCategory: RequestHandler = async (req, res) => {

  console.log("createCategory called");
  const name = (req.body?.name as string | undefined)?.trim();
  if (!name) {
    res.status(400).json({ message: "name is required" });
    return;
  }

  const dup = await findDup(name, null, 0);
  if (dup) {
    res.status(409).json({ message: "Category already exists", data: dup });
    return;
  }

  const doc = await Category.create({ name, parent: null, level: 0, path: [], isActive: true });
  res.status(201).json({ data: doc });
};

export const createSubCategory: RequestHandler = async (req, res) => {
  const { categoryId } = req.params;
  const name = (req.body?.name as string | undefined)?.trim();

  if (!okId(categoryId)) {
    res.status(400).json({ message: "Invalid categoryId" });
    return;
  }
  if (!name) {
    res.status(400).json({ message: "name is required" });
    return;
  }

  const par = await Category.findById(categoryId).select("level").lean();
  if (!par) {
    res.status(404).json({ message: "Parent category not found" });
    return;
  }
  if (par.level !== 0) {
    res.status(400).json({ message: "Parent must be level 0 category" });
    return;
  }

  const dup = await findDup(name, new Types.ObjectId(categoryId), 1);
  if (dup) {
    res.status(409).json({ message: "Sub-category already exists", data: dup });
    return;
  }

  const doc = await Category.create({
    name,
    parent: categoryId,
    level: 1,
    path: [new Types.ObjectId(categoryId)],
    isActive: true,
  });

  res.status(201).json({ data: doc });
};

export const createSubSubCategory: RequestHandler = async (req, res) => {
  const { subCategoryId } = req.params;
  const name = (req.body?.name as string | undefined)?.trim();

  if (!okId(subCategoryId)) {
    res.status(400).json({ message: "Invalid subCategoryId" });
    return;
  }
  if (!name) {
    res.status(400).json({ message: "name is required" });
    return;
  }

  const par = await Category.findById(subCategoryId).select("level path").lean();
  if (!par) {
    res.status(404).json({ message: "Parent sub-category not found" });
    return;
  }
  if (par.level !== 1) {
    res.status(400).json({ message: "Parent must be level 1 sub-category" });
    return;
  }

  const dup = await findDup(name, new Types.ObjectId(subCategoryId), 2);
  if (dup) {
    res.status(409).json({ message: "Sub-sub-category already exists", data: dup });
    return;
  }

  const doc = await Category.create({
    name,
    parent: subCategoryId,
    level: 2,
    path: [...(par.path || []), new Types.ObjectId(subCategoryId)],
    isActive: true,
  });

  res.status(201).json({ data: doc });
};
