import express from "express";
import morgan from "morgan";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";

const app = express();

// middleware
app.use(express.json());
app.use(morgan("dev")); // Gives information about the API
app.use(cookieParser());

// routes prefix
app.use("/api/auth", authRouter);

// Global Error Handler (returns clean JSON instead of HTML)
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(err.status || 500).json({
        message: err.message || "Internal server error"
    });
});

export default app;
