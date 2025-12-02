import dotenv from "dotenv";

dotenv.config();

export const   JWT_ACCESS_SECRET = process.env.JWT_SECRET || "your_default_jwt_secret";
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your_default_jwt_refresh_secret";
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "your_default_cloudinary_api_key";
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || "your_default_cloudinary_api_secret";
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "your_default_cloudinary_cloud_name";
export const PORT=process.env.PORT||3000;
export const ENVMODE=process.env.ENVMODE||"DEV";
export const COOKIE_EXPIRY_DAYS = 3;
export const MongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/ursdb";
export const ProdMongoURI = process.env.PRODUCTION_DB! as string;


