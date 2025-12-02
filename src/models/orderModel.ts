import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        variantId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product.variants",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    status: {
      type: String,
      enum: ["Placed", "Shipped", "cancelled", "delivered"],
      default: "Placed",
    },
    totalAmount: {
      type: Number,
      required: true,
    },

    address: {
      Receiver_Name: {
        type: String,
        required: true,
      },
      Receiver_MobileNumber: {
        type: String,
        required: true,
      },
      Address_Line1: {
        type: String,
        required: true,
      },
      Address_Line2: {
        type: String,
      },

      City: {
        type: String,
        required: true,
      },
      pincode: {
        type: String,
        required: true,
      },
      label: {
        type: String,
        required: true,
      },
    },
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;
