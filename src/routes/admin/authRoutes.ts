import express from "express";
import {
  adminLogin,
  adminregister,
  refreshToken,
} from "../../controllers/admin/Auth/login.js";

const router = express.Router();
router.route("/login").post(adminLogin);
router.route("/signup").post(adminregister);
router.route("/refresh").post(refreshToken);

export default router;
