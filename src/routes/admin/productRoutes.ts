import express from "express";
import {
  createProductAdmin,
  getAllProductsAdmin,
  getProductAdminById,
} from "../../controllers/admin/Products/createProducts.js";
import uploadProductImages from "../../middlewares/uploadProductImages.js";
import { updateStock } from "../../controllers/admin/Products/productUpdate.js";
import { deleteProduct } from "../../controllers/admin/Products/deleteProduct.js";

const router = express.Router();

router.route("/getproducts").get(getAllProductsAdmin);
router.route("/products/:id").get(getProductAdminById);

router.route("/addproduct").post(uploadProductImages, createProductAdmin);

router.route("/updateproductstockbyid").put(updateStock);
router.route("/deleteproduct/:id").delete(deleteProduct);

export default router;
