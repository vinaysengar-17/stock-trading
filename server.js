import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import tradeRoutes from "./routes/tradeRoutes.js";
import lotRoutes from "./routes/lotRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Connect to DB
connectDB();

// Mount the Trade API routes
app.use("/api/trades", tradeRoutes);

// Mount the Lots API routes
app.use("/api/lots", lotRoutes);

app.get("/", (req, res) => {
  res.send("Stock Trading API is Running...");
});

// Error handler
app.use((err, req, res, next) => {
  res.status(500).json({ status: "error", message: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
