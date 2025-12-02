

import User from "../../../models/userModel.js";
import Order from "../../../models/orderModel.js";
import Product from "../../../models/productModel.js";
import TryCatch from "../../../utils/Trycatch.js";
import ErrorHandler from "../../../middlewares/ErrorHandler.js";
import { NextFunction, Request, Response } from "express";

export const getReport = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { from, to } = req.query as {
      from?: string;
      to?: string;
    };

    const orderFilter: any = {};

    // Date range filter (optional)
    if (from || to) {
      const createdAt: any = {};
      if (from) {
        const fromDate = new Date(from);
        if (!isNaN(fromDate.getTime())) {
          createdAt.$gte = fromDate;
        }
      }
      if (to) {
        const toDate = new Date(to);
        if (!isNaN(toDate.getTime())) {
          createdAt.$lte = toDate;
        }
      }
      if (Object.keys(createdAt).length > 0) {
        orderFilter.createdAt = createdAt;
      }
    }

    // Fetch orders (for stats) + total registered users
    const [orders, totalUsersRegistered] = await Promise.all([
      Order.find(orderFilter)
        .select("totalAmount products userId")
        .lean(),
      User.countDocuments(),
    ]);

    if (!orders || orders.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Report fetched successfully",
        revenue: 0,
        noOfOrders: 0,
        noOfProductSales: 0,
        noOfUsersOrdered: 0,
        noOfUsersRegistered: totalUsersRegistered,
      });
    }

    let revenue = 0;
    let totalProductSales = 0;
    const userSet = new Set<string>();

    for (const order of orders) {
      if (typeof order.totalAmount === "number") {
        revenue += order.totalAmount;
      }

      if (Array.isArray(order.products)) {
        for (const p of order.products) {
          const qty =
            typeof p.quantity === "number" ? p.quantity : 0;
          totalProductSales += qty;
        }
      }

      if (order.userId) {
        userSet.add(order.userId.toString());
      }
    }

    const noOfOrders = orders.length;
    const noOfUsersOrdered = userSet.size;

    return res.status(200).json({
      success: true,
      message: "Report fetched successfully",
      revenue,
      noOfOrders,
      noOfProductSales: totalProductSales,
      noOfUsersOrdered,
      noOfUsersRegistered: totalUsersRegistered,
    });
  }
);
