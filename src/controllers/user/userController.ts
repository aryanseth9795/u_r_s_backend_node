import { NextFunction, Request, Response } from "express";
import TryCatch from "../../utils/Trycatch.js";
import User from "../../models/userModel.js";
import ErrorHandler from "../../middlewares/ErrorHandler.js";

export const getUserDetails = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.user;
    const user = await User.findById(id).lean();

    if (!user) return next(new ErrorHandler("No User Found", 404));
    res
      .status(200)
      .json({ success: true, message: "User Fetched Successfully", user });
  }
);


// export const updateUserDetails=TryCatch(async()=>{})