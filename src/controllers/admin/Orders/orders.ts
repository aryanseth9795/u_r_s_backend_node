import Order from "../../../models/orderModel.js";
import Product from "../../../models/productModel.js";

import ErrorHandler from "../../../middlewares/ErrorHandler.js";
import TryCatch from "../../../utils/Trycatch.js";
import { NextFunction, Request, Response } from "express";

export const getAllOrders = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;
    const status = req.query.status as string | undefined;

    const filter: any = {};
    let hasDateFilter = false;
    let hasStatusFilter = false;

    // ----- date filter -----
    let fromDate: Date | undefined;
    if (from) {
      const d = new Date(from);
      if (!isNaN(d.getTime())) {
        fromDate = d;
        hasDateFilter = true;
      }
    }

    let toDate: Date | undefined;
    if (to) {
      const d = new Date(to);
      if (!isNaN(d.getTime())) {
        toDate = d;
        hasDateFilter = true;
      }
    }

    if (hasDateFilter) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = fromDate;
      if (toDate) filter.createdAt.$lte = toDate;
    }

    // ----- status filter -----
    if (status) {
      filter.status = status;
      hasStatusFilter = true;
    }

    // ----- query -----
    let query = Order.find(filter).sort({ createdAt: -1 });

    // if no filters at all => return only recent data
    if (!hasDateFilter && !hasStatusFilter) {
      query = query.limit(30);
    }

    const orders = await query.lean();

    if (!orders || orders.length === 0) {
      return next(new ErrorHandler("No Orders Found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Orders Fetched SuccessFully",
      orders,
    });
  }
);


export const getOrdersDetails = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const orderId = req.params.id;

    // get order + basic user info
    const order:any = await Order.findById(orderId)
      .populate("userId", "name mobilenumber")
      .lean();

    if (!order) {
      return next(new ErrorHandler("No Orders Found", 404));
    }

    const user: any = order.userId;

    // collect all productIds from order
    const productIds = (order.products || []).map(
      (p: any) => p.productId
    );

    const products = await Product.find({ _id: { $in: productIds } })
      .select("_id name thumbnail variants")
      .lean();

    const productMap = new Map<string, any>();
    products.forEach((p: any) => {
      productMap.set(p._id.toString(), p);
    });

    let noOfProducts = 0;

    const productDetails = (order.products || []).map((p: any) => {
      const prod = productMap.get(p.productId.toString());
      const quantity = typeof p.quantity === "number" ? p.quantity : 0;
      noOfProducts += quantity;

      // pick thumbnail from product (fallback: first variant image if you want)
      const thumbnail =
        prod?.thumbnail ??
        (Array.isArray(prod?.variants) &&
        prod.variants.length > 0 &&
        Array.isArray(prod.variants[0].images) &&
        prod.variants[0].images.length > 0
          ? prod.variants[0].images[0]
          : undefined);

      return {
        _id: p.productId,
        variantId: p.variantId,
        name: prod?.name ?? "",
        thumbnail,
        quantity,
      };
    });

    const orderDetail = {
      _id: order._id,
      name: user?.name ?? "",
      mobilenumber: user?.mobilenumber ?? "",
      address: order.address, // from order model
      totalAmount: order.totalAmount,
      noOfProducts,
      products: productDetails,
    };

    res.status(200).json({
      success: true,
      message: "Order Fetched Successfully",
      orderDetail,
    });
  }
);


export const orderUpdateStatus = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { status, OrderId } = req.body;

    const order = await Order.findById(OrderId);
    if (!order) return next(new ErrorHandler("No orders Found", 404));

    order.status = status;
    order.save();

    res
      .status(200)
      .json({ success: true, message: `Status updated to ${status}` });
  }
);


export const getRecentordersbyUserId = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    const orders = await Order.find({ userId: id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    if (!orders) {
      return next(new ErrorHandler("No Orders Found For this Id", 404));
    }
    res.status(200).json({
      success: true,
      message: "Order Fetch Successfully",
      orders,
    });
  }
);