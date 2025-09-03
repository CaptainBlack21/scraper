import express from "express";
import ProcessedProduct from "../models/ProcessedProduct";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const items = await ProcessedProduct.find()
      .sort({ processedAt: -1 })
      .limit(100);
    res.json(items);
  } catch {
    res.status(500).json({ error: "İşlenen ürünler alınamadı" });
  }
});

export default router;
