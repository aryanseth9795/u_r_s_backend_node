import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";

import {
  PORT,
  ENVMODE,
  MongoURI,
  ProdMongoURI,
} from "./src/constants/constants.js";
import errorMiddleware from "./src/middlewares/errorMiddleware.js";
import dbConnect from "./src/db/db.js";
import adminRoutes from "./src/routes/admin/index.js";

console.log(`Starting relay in ${ENVMODE} mode...`);

const app = express();

app.use(express.json());
app.use(cookieParser());

//Db controller
// dbConnect(MongoURI);
dbConnect(ProdMongoURI);

// app.use("/api/v1/", userRoute);
app.use("/api/v1/admin", adminRoutes);

app.use(errorMiddleware);

// seedDummyOrders();
app.listen(PORT, () => {
  console.log(`Relay ready on http://localhost:${PORT} in ${ENVMODE} mode.`);
});
