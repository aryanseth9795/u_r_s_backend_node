
import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../../../middlewares/ErrorHandler.js";
import User from "../../../models/userModel.js";
import bcrypt from "bcrypt";
import { RangeKey } from "../../../types/adminTypes.js";
import TryCatch from "../../../utils/Trycatch.js";
import Order from "../../../models/orderModel.js";
import buildCreatedAtFilter from "../../../utils/datefilter.js";
import cloudinary from "../../../utils/cloudinary.js";

import Product from "../../../models/productModel.js";
import { ProcessedImage } from "../../../middlewares/uploadProductImages.js";

import {
  generate_Access_Token,
  generate_Refresh_Token,
} from "../../../utils/token.js";


export const adminDetails = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const adminId = req.user?.id;
    const admin = await User.findById(adminId).select("-password");
    if (!admin) {
      return next(new ErrorHandler("Admin not found", 404));
    }
    res.status(200).json({
      success: true,
      admin,
    });
  }
);

export const getUserList = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
 
    const users = await User.find({}).lean();
    if (!users) {
      return next(new ErrorHandler("Admin not found", 404));
    }
    res.status(200).json({
      success: true,
      users,
    });
  }
);

