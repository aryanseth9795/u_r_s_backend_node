import { NextFunction, Request, Response } from "express";
import TryCatch from "../../utils/Trycatch.js";
import Order from "../../models/orderModel.js";
export const createOrderByUser = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;
  }
);

export const getOrdersList = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.user?.id;

    const orders = await Order.find({ userId: id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.status(200).json({ success: true, orders });
  }
);

export const getOrderDetails = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.body;

    const order = await Order.findById(productId).populate("userId" , "name mobilenumber" ).lean();

    res.status(200).json({ success: true, order });
  }
);
