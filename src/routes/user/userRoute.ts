import express from "express";
import {
  getUserDetails,
  addAddress,
  editAddress,
  deleteAddress,
} from "../../controllers/user/userController.js";
import { isAuthenticatedUser } from "../../middlewares/auth.js";

const router = express.Router();

// User details route
router.get("/details", isAuthenticatedUser, getUserDetails);

// Address management routes
router.post("/address/add", isAuthenticatedUser, addAddress);
router.put("/address/edit/:addressId", isAuthenticatedUser, editAddress);
router.delete("/address/delete/:addressId", isAuthenticatedUser, deleteAddress);

export default router;
