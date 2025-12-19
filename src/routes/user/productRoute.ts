import express from "express";
import {
  getProductByID,
  getProductListUser,
} from "../../controllers/user/productController.js";

const router = express.Router();
router.route("/getproducts").get(getProductListUser);
router.route("/products/:id").get(getProductByID);

export default router;
