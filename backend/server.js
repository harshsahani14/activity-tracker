import express from "express";
import dotenv from "dotenv";
import authRouter from "./routes/authRouter.js";
import activityRouter from "./routes/activityRouter.js";
import { connectDb } from "./lib/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/activity", activityRouter);

app.get("/", (req, res) => {
  res.json({ message: "Activity Tracker API running" });
});

connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
