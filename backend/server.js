import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/database.js";
import { errorHandler } from "./middleware/errorHandler.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import walletRoutes from "./routes/wallet.routes.js";
import kycRoutes from "./routes/kyc.routes.js";
import productsRoutes from "./routes/products.routes.js";
import premiumRoutes from "./routes/premium.routes.js";
import tradingRoutes from "./routes/trading.routes.js";
import securityRoutes from "./routes/security.routes.js";
import reportsRoutes from "./routes/reports.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to Database
connectDB();

// Security Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:4200",
    credentials: true,
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use("/api/", limiter);

// Body Parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Health Check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/premium", premiumRoutes);
app.use("/api/trading", tradingRoutes);
app.use("/api/security", securityRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/uploads", uploadRoutes);

// Error Handler
app.use(errorHandler);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
