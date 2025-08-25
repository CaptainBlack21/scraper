import dotenv from "dotenv";
import path from "path";

// .env'i her zaman çalışma klasöründen (exe'nin yanından) yükle
dotenv.config({ path: path.join(process.cwd(), ".env") });

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { exec } from "node:child_process";

import "./jobs/priceUpdater";
import productRoutes from "./routes/productRoutes";

const PORT = Number(process.env.PORT) || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || `http://127.0.0.1:${PORT}`;

// --- MONGO_URI doğrulama ---
const MONGO_URI_RAW = process.env.MONGO_URI?.trim();
if (!MONGO_URI_RAW) {
  console.error("❌ MONGO_URI .env içinde tanımlı değil veya boş!");
  process.exit(1);
}
if (!/^mongodb(\+srv)?:\/\//i.test(MONGO_URI_RAW)) {
  console.error("❌ MONGO_URI 'mongodb://' veya 'mongodb+srv://' ile başlamalı!");
  process.exit(1);
}
const MONGO_URI: string = MONGO_URI_RAW;
// ---------------------------

const app = express();
app.use(express.json());
app.use(cors({ origin: CORS_ORIGIN, methods: ["GET", "POST", "PUT", "DELETE"] }));

// API
app.use("/products", productRoutes);

// === Frontend (public) yolu ===
const isPkg = (process as any).pkg !== undefined;
const publicDir = isPkg
  ? path.join(process.cwd(), "public")         // exe'nin yanındaki public/
  : path.join(__dirname, "../public");         // dev/build: dist/../public

app.use(express.static(publicDir));
// Express v5: catch-all için regex
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// Windows'ta varsayılan tarayıcıyı aç
function openBrowser(url: string) {
  try {
    exec(`start "" "${url}"`);
  } catch {}
}

async function start() {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 } as any);
    console.log("✅ MongoDB Connected");

    app.listen(PORT, () => {
      const url = `http://127.0.0.1:${PORT}`;
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Open: ${url}`);
      openBrowser(url);
    });
  } catch (err) {
    console.error("❌ MongoDB Error:", err);
    process.exit(1);
  }
}

start();

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});
