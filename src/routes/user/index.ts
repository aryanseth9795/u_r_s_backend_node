import express from "express";
import isAuthenticated from "../../middlewares/auth.js";
import authRoutes from "./authRoute.js";
import userRoutes from "./userRoute.js";
import productRoute from "./productRoute.js";
import orderRoute from "./orderRoute.js";

const router = express.Router();

// Auth routes (public)
router.use("/auth", authRoutes);

// Product routes (public)
router.use("/products", productRoute);

// Order routes (protected)
router.use("/orders", orderRoute);

// User routes (protected)
router.use("/user", userRoutes);

export default router;
