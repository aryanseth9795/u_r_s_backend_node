import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../../../middlewares/ErrorHandler.js";
import User from "../../../models/userModel.js";
import bcrypt from "bcrypt";
import TryCatch from "../../../utils/Trycatch.js";
import {
  generate_Access_Token,
  generate_Refresh_Token,
} from "../../../utils/token.js";
import jwt from "jsonwebtoken";
import { JWT_REFRESH_SECRET } from "../../../constants/constants.js";

export const adminLogin = TryCatch(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { mobilenumber, password } = req.body;
    console.log(mobilenumber, password);

    if (!mobilenumber || !password) {
      return next(
        new ErrorHandler("Mobile number and password are required", 400)
      );
    }
    const user = await User.findOne({ mobilenumber: mobilenumber }).select(
      "+password"
    );

    if (!user) {
      return next(new ErrorHandler("Invalid mobile number or password", 401));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("Invalid password attempt for admin:", mobilenumber);
      return next(new ErrorHandler("Invalid mobile number or password", 401));
    }
    if (user.role !== "admin") {
      return next(new ErrorHandler("Access denied. Admins only.", 403));
    }

    const token = generate_Access_Token({ id: user._id, role: user.role });

    const refreshToken = generate_Refresh_Token(token);

    res.status(200).json({
      success: true,
      access_token: token,
      refresh_token: refreshToken,
      message: "Admin logged in successfully",
    });
  }
);

export const adminregister = TryCatch(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { name, mobilenumber, password } = req.body;
    const existingAdmin = await User.findOne({
      mobilenumber: mobilenumber,
      role: "admin",
    });
    if (existingAdmin) {
      return next(
        new ErrorHandler("Admin with this mobile number already exists", 400)
      );
    }

    const newadmin = await User.create({
      name,
      mobilenumber,
      password,
      role: "admin",
    });

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
    });
  }
);

export const refreshToken = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { refresh_token } = req.body;
    console.log("refresh api called");
    if (!refresh_token) {
      return next(new ErrorHandler("No refresh token provided", 400));
    }

    // Verify refresh token
    let decoded: any;
    try {
      decoded = jwt.verify(refresh_token, JWT_REFRESH_SECRET);
    } catch (err) {
      console.log(err);
      return next(new ErrorHandler("Invalid refresh token", 401));
    }

    const token = generate_Access_Token({
      id: decoded.id,
      role: decoded.role,
    });
    console.log("Generated access token:", token);
    const refreshToken = generate_Refresh_Token(token);

    res.status(200).json({
      success: true,
      access_token: token,
      refresh_token: refreshToken,
      message: "Token Refreshed Successfully",
    });
  }
);
