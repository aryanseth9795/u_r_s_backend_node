import express from "express";
import isAdminAuthenticated from "../../middlewares/adminAuth.js";
import {
  getAllOrders,
  getOrdersDetails,
  getRecentordersbyUserId,
  orderUpdateStatus,
} from "../../controllers/admin/Orders/orders.js";

const router = express.Router();

router.use(isAdminAuthenticated);
router.route("/allorders/date").get(getAllOrders);
router.route("/orders/:id").get(getOrdersDetails)
router.route("/orders/status").put(orderUpdateStatus);
router.route("/orders/user/:id").get(getRecentordersbyUserId);

export default router;
