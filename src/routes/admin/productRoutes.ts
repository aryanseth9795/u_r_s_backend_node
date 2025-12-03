
import express from 'express';
import { createProductAdmin, getAllProductsAdmin, getProductAdminById } from '../../controllers/admin/Products/createProducts.js';
import uploadProductImages from '../../middlewares/uploadProductImages.js';
import { updateStock } from '../../controllers/admin/Products/productUpdate.js';


const router=express.Router();

router.route("/getproducts").get(getAllProductsAdmin);
router.route("/products/:id").get(getProductAdminById).put(updateStock);
router.route("/addproduct").post(uploadProductImages,createProductAdmin);


export default router;
