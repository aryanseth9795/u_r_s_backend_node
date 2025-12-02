import express from "express";
import { adminDetails } from "../../controllers/admin/Auth/user.js";

const router = express.Router();

router.route("/me").get(adminDetails);
// router.route("").get(adminDetails);

export default router;
