import { NextFunction, Request, Response } from "express";
import TryCatch from "../../utils/Trycatch.js";
import User from "../../models/userModel.js";
import ErrorHandler from "../../middlewares/ErrorHandler.js";
import bcrypt from "bcrypt";
import {
  generate_Access_Token,
  generate_Refresh_Token,
} from "../../utils/token.js";
import { JWT_REFRESH_SECRET } from "../../constants/constants.js";
import jwt from 'jsonwebtoken'


export const userLogin = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { mobilenumber, password } = req.body;

    const user = await User.findOne({ mobilenumber }).select("+password");

    if (!user) {
      return next(
        new ErrorHandler("No Accounts Available for this Credentials", 404)
      );
    }

    const isMatched = await bcrypt.compare(user.password, password);

    if (!isMatched)
      return next(
        new ErrorHandler("No Accounts Available for this Credentials", 404)
      );

    const access_token = generate_Access_Token({ id: user._id, role: "user" });
    const refresh_token = generate_Refresh_Token(access_token);

    res.status(200).json({ success: true, access_token, refresh_token });
  }
);


export const userRegister = TryCatch(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { name, mobilenumber, password } = req.body;
    const existinguser = await User.findOne({
      mobilenumber: mobilenumber,
      role: "user",
    });
    if (existinguser) {
      return next(
        new ErrorHandler("User with this mobile number already exists", 400)
      );
    }

    const newuser = await User.create({
      name,
      mobilenumber,
      password,
      role: "admin",
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  }
);

export const refreshTokenUser = TryCatch(
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
