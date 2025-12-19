import express from "express";
import isAuthenticated from "../../middlewares/auth.js";
import authRoutes from "./authRoute.js";
import userRoutes from "./userRoute.js";
import productRoute from "./productRoute.js";
import orderRoute from "./orderRoute.js";


const router = express.Router();


router.use(authRoutes);
router.use(productRoute);
router.use(isAuthenticated);
router.use(orderRoute);
router.use(userRoutes);


export default router;