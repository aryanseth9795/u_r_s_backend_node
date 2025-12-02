// src/prisma/client.ts

import mongoose from "mongoose";

const dbConnect = async (url: string) => {
  try {
    await mongoose.connect(url);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    // throw error;
  }
};
export default dbConnect;
