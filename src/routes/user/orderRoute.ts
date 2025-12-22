import express from "express";
import {
  createOrderByUser,
  getOrdersList,
  getOrderDetails,
  cancelOrder,
} from "../../controllers/user/orderController.js";
import { isAuthenticatedUser } from "../../middlewares/auth.js";

const router = express.Router();

// Order management routes
router.post("/create", isAuthenticatedUser, createOrderByUser);
router.get("/list", isAuthenticatedUser, getOrdersList);
router.post("/details", isAuthenticatedUser, getOrderDetails);
router.post("/cancel", isAuthenticatedUser, cancelOrder);

export default router;
