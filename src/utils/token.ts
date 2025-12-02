import jwt from "jsonwebtoken";
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from "../constants/constants.js";

export const generate_Access_Token = (payload: object): string => {
  console.log("Generating access token with payload:", payload);

  try {
    const token = jwt.sign(payload, JWT_ACCESS_SECRET, {
      expiresIn:'7d',
    });

    console.log("Generated access token:", token);
    return token;

  } catch (error) {
    console.error("JWT Access Token Error:", error);
    throw error;
  }
};

export const generate_Refresh_Token = (token: string): string => {
  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as jwt.JwtPayload;

    delete decoded.iat;
    delete decoded.exp;

    const newToken = jwt.sign(decoded, JWT_REFRESH_SECRET, {
      expiresIn: "30d",
    });

    return newToken;

  } catch (error) {
    console.error("JWT Refresh Token Error:", error);
    throw error;
  }
};
