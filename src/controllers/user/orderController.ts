import { NextFunction, Request, Response } from "express";
import TryCatch from "../../utils/Trycatch.js";
import Order from "../../models/orderModel.js";
import Product from "../../models/productModel.js";
import ErrorHandler from "../../middlewares/ErrorHandler.js";

export const createOrderByUser = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const { products, address } = req.body as {
      products: Array<{
        productId: string;
        variantId: string;
        quantity: number;
      }>;
      address: {
        Receiver_Name: string;
        Receiver_MobileNumber: string;
        Address_Line1: string;
        Address_Line2?: string;
        City: string;
        pincode: string;
        label: string;
      };
    };

    // Validation
    if (!userId) {
      return next(new ErrorHandler("User not authenticated", 401));
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
      return next(new ErrorHandler("Products are required", 400));
    }

    if (!address) {
      return next(new ErrorHandler("Delivery address is required", 400));
    }

    // Validate address fields
    const requiredAddressFields = [
      "Receiver_Name",
      "Receiver_MobileNumber",
      "Address_Line1",
      "City",
      "pincode",
      "label",
    ];
    for (const field of requiredAddressFields) {
      if (!address[field as keyof typeof address]) {
        return next(
          new ErrorHandler(`Address field '${field}' is required`, 400)
        );
      }
    }

    // Validate and process products
    const orderProducts = [];
    let totalAmount = 0;

    for (const item of products) {
      if (!item.productId || !item.variantId || !item.quantity) {
        return next(
          new ErrorHandler(
            "Each product must have productId, variantId, and quantity",
            400
          )
        );
      }

      if (item.quantity <= 0) {
        return next(new ErrorHandler("Quantity must be greater than 0", 400));
      }

      // Fetch product with variant details
      const product = await Product.findById(item.productId);

      if (!product) {
        return next(
          new ErrorHandler(`Product ${item.productId} not found`, 404)
        );
      }

      if (!product.isActive) {
        return next(
          new ErrorHandler(
            `Product ${product.name} is currently unavailable`,
            400
          )
        );
      }

      // Find specific variant
      const variant = product.variants.find(
        (v) => v._id.toString() === item.variantId
      );

      if (!variant) {
        return next(
          new ErrorHandler(
            `Variant ${item.variantId} not found for product ${product.name}`,
            404
          )
        );
      }

      if (!variant.isActive) {
        return next(
          new ErrorHandler(
            `Selected variant for ${product.name} is currently unavailable`,
            400
          )
        );
      }

      // Check stock availability
      if (variant.stock < item.quantity) {
        return next(
          new ErrorHandler(
            `Insufficient stock for ${product.name}. Available: ${variant.stock}, Requested: ${item.quantity}`,
            400
          )
        );
      }

      // Calculate price based on quantity tiers
      let pricePerUnit = variant.mrp;

      // Sort selling prices by minQuantity descending to find the best price tier
      const sortedPrices = [...variant.sellingPrices].sort(
        (a, b) => b.minQuantity - a.minQuantity
      );

      for (const tier of sortedPrices) {
        if (item.quantity >= tier.minQuantity) {
          pricePerUnit = tier.price;
          break;
        }
      }

      const itemTotal = pricePerUnit * item.quantity;
      totalAmount += itemTotal;

      orderProducts.push({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: pricePerUnit,
      });
    }

    // Create order
    const order = await Order.create({
      userId,
      products: orderProducts,
      totalAmount,
      address,
      status: "Placed",
    });

    // Deduct stock from variants
    for (const item of products) {
      await Product.updateOne(
        {
          _id: item.productId,
          "variants._id": item.variantId,
        },
        {
          $inc: {
            "variants.$.stock": -item.quantity,
          },
        }
      );
    }

    // Populate order details for response
    const populatedOrder = await Order.findById(order._id)
      .populate("userId", "name email mobilenumber")
      .populate("products.productId", "name thumbnail brand")
      .lean();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: populatedOrder,
    });
  }
);

export const getOrdersList = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.user?.id;

    const orders = await Order.find({ userId: id })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    // Populate only the first product's thumbnail and format response
    const formattedOrders = await Promise.all(
      orders.map(async (order) => {
        let thumbnailUrl = null;

        if (order.products && order.products.length > 0) {
          const firstProduct = await Product.findById(
            order.products[0].productId
          )
            .select("thumbnail")
            .lean();

          thumbnailUrl = firstProduct?.thumbnail?.secureUrl || null;
        }

        return {
          _id: order._id,
          thumbnail: thumbnailUrl,
          status: order.status,
          totalPrice: order.totalAmount,
          numberOfProducts: order.products.length,
          createdAt: order.createdAt,
        };
      })
    );

    res.status(200).json({ success: true, orders: formattedOrders });
  }
);

export const getOrderDetails = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.body;

    const order = await Order.findById(orderId)
      .populate("userId", "name mobilenumber")
      .populate("products.productId", "name thumbnail")
      .lean();

    res.status(200).json({ success: true, order });
  }
);

export const cancelOrder = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const { orderId } = req.body;

    // Validation
    if (!userId) {
      return next(new ErrorHandler("User not authenticated", 401));
    }

    if (!orderId) {
      return next(new ErrorHandler("Order ID is required", 400));
    }

    // Find the order
    const order = await Order.findById(orderId);

    if (!order) {
      return next(new ErrorHandler("Order not found", 404));
    }

    // Verify order belongs to the user
    if (order.userId.toString() !== userId) {
      return next(
        new ErrorHandler("You are not authorized to cancel this order", 403)
      );
    }

    // Check if order can be cancelled
    if (order.status === "Shipped" || order.status === "delivered") {
      return next(
        new ErrorHandler(
          `Cannot cancel order. Order has already been ${order.status.toLowerCase()}`,
          400
        )
      );
    }

    if (order.status === "cancelled") {
      return next(new ErrorHandler("Order is already cancelled", 400));
    }

    // Restore stock for all products in the order
    for (const item of order.products) {
      await Product.updateOne(
        {
          _id: item.productId,
          "variants._id": item.variantId,
        },
        {
          $inc: {
            "variants.$.stock": item.quantity,
          },
        }
      );
    }

    // Update order status to cancelled
    order.status = "cancelled";
    await order.save();

    // Return updated order with populated data
    const cancelledOrder = await Order.findById(orderId)
      .populate("userId", "name email mobilenumber")
      .populate("products.productId", "name thumbnail brand")
      .lean();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully. Stock has been restored.",
      order: cancelledOrder,
    });
  }
);
