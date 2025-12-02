import express from "express";
import isAdminAuthenticated from "../../middlewares/adminAuth.js";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import productRoute from "./productRoutes.js";
import orderRoute from "./orderRoutes.js";
import reportsRoute from "./reportsRoutes.js";

const router = express.Router();

// router.use("/admin");
router.use(authRoutes);
router.use(isAdminAuthenticated);
router.use(orderRoute);
router.use(userRoutes);
router.use(productRoute);
router.use(reportsRoute);

export default router;
