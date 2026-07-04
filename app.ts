import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import helmet from "helmet";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use("/api/auth", authRoutes);

export default app;