


import express from "express";
import { refreshTokenUser, userLogin, userRegister } from "../../controllers/user/authController.js";


const router = express.Router();
router.route("/login").post(userLogin);
router.route("/signup").post(userRegister);
router.route("/refresh").post(refreshTokenUser);

export default router;
