import TryCatch from "../../../utils/Trycatch.js";
import Product from "../../../models/productModel.js";
import ErrorHandler from "../../../middlewares/ErrorHandler.js";
import { Request, Response,NextFunction } from "express";


export const deleteProduct=TryCatch(async(req:Request,res:Response,next:NextFunction)=>{
    const {id}=req.params;
    const product=await Product.findByIdAndDelete(id, {new:true});
    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }
    res.status(200).json({
        success:true,
        message:"Product deleted successfully"
    })
})  