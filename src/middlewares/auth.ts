import { Request, Response, NextFunction } from "express";
import ErrorHandler from "./ErrorHandler.js";
import jwt from "jsonwebtoken";
import { UserPayload } from "../interface/userInterface.js";
import { JWT_ACCESS_SECRET } from "../constants/constants.js";

const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.split(" ")[1] as string | undefined;

  if (!token)
    return next(new ErrorHandler("Please login to access this resource", 401));

  let decoded: unknown;
  try {
    decoded = jwt.verify(token, JWT_ACCESS_SECRET);
  } catch (error) {
    return next(new ErrorHandler("Invalid or expired token", 401));
  }

  if (!decoded || typeof decoded === "string" || !(decoded as any).id) {
    return next(new ErrorHandler("Invalid token payload", 401));
  }

  const { id, role } = decoded as UserPayload;
  console.log("Admin Authenticated User ID:", id, "Role:", role);
  if (role !== "admin") {
    return next(new ErrorHandler("Access denied. Admins only.", 403));
  }
  req.user = { id, role };
  return next();
};

// User authentication middleware (no admin check)
export const isAuthenticatedUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.split(" ")[1] as string | undefined;

  if (!token)
    return next(new ErrorHandler("Please login to access this resource", 401));

  let decoded: unknown;
  try {
    decoded = jwt.verify(token, JWT_ACCESS_SECRET);
  } catch (error) {
    return next(new ErrorHandler("Invalid or expired token", 401));
  }

  if (!decoded || typeof decoded === "string" || !(decoded as any).id) {
    return next(new ErrorHandler("Invalid token payload", 401));
  }

  const { id, role } = decoded as UserPayload;
  console.log("Authenticated User ID:", id, "Role:", role);
  req.user = { id, role };
  return next();
};

export default isAuthenticated;
