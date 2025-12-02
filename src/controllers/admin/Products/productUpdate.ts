import TryCatch from "../../../utils/Trycatch.js";
import Product from "../../../models/productModel.js";
import ErrorHandler from "../../../middlewares/ErrorHandler.js";
import { Request, Response, NextFunction } from "express";

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

export const updateProduct = TryCatch(
  async (req: Request, Res: Response, next: NextFunction) => {
    const { productId, variantId, stock } = req.body;

    const result = await Product.findById(productId);

    if (!result) {
      return next(new ErrorHandler("Product Not Found with this ID", 404));
    }

    result?.variants?.forEach((variant: any) => {
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
