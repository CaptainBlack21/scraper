import express from "express";
import mongoose from "mongoose";
import productRoutes from "./routes/productRoutes";
import cors from "cors"; // <-- yeni
// Cron job’u başlat
import "./jobs/priceUpdater";

const app = express();
app.use(express.json());

// CORS middleware
app.use(cors({
  origin: "http://localhost:5173", // frontend adresi
  methods: ["GET","POST","PUT","DELETE"],
}));

// MongoDB bağlantısı
mongoose.connect("mongodb://127.0.0.1:27017/price-tracker")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// Routes
app.use("/products", productRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
