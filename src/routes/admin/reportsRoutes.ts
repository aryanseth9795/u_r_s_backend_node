
import express from "express";
import { getUserList } from "../../controllers/admin/Auth/user.js";
import { getReport } from "../../controllers/admin/Reports/reports.js";


const router=express.Router();




router.route("/userlist").get(getUserList);
router.route("/report").get(getReport);



// router.route("/").get(getUserList);


export default router;