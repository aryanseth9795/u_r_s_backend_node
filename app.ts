import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import axios from "axios";
import {
  PORT,
  ENVMODE,
  MongoURI,
  ProdMongoURI,
  PING_TIME,
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

const keepServerAwake = () => {
  setInterval(async () => {
    try {
      await axios.get(process.env.PING_URL);
      console.log("✅ Server pinged to prevent sleep");
    } catch (error) {
      console.error("❌ Error pinging server:", error.message);
    }
  }, PING_TIME*60*1000); // Ping every 10 minutes
};
keepServerAwake()
// seedDummyOrders();
app.listen(PORT, () => {
  console.log(`Relay ready on http://localhost:${PORT} in ${ENVMODE} mode.`);
});
