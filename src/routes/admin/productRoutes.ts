
import express from 'express';
import { createProductAdmin, getAllProductsAdmin, getProductAdminById } from '../../controllers/admin/Products/createProducts.js';
import uploadProductImages from '../../middlewares/uploadProductImages.js';
import { updateStock } from '../../controllers/admin/Products/productUpdate.js';


const router=express.Router();

router.route("/getproducts").get(getAllProductsAdmin);
router.route("/products/:id").get(getProductAdminById).put(updateStock);
<<<<<<< HEAD
router.route("/addproduct").post(uploadProductImages,createProductAdmin);
=======
router.route("/products").post(uploadProductImages,createProductAdmin);
>>>>>>> 04e253e8f401d3a8058f20ecbdc1985802cb761d


export default router;
