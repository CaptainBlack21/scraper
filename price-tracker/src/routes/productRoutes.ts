import express from "express";
import Product from "../models/Product";
import { scrapeAmazonProduct } from "../services/scraper";

const router = express.Router();

// Yeni ürün ekle
router.post("/", async (req, res) => {
  try {
    const { url } = req.body;

    // Scraper çalıştır
    const { title, price } = await scrapeAmazonProduct(url);

    // MongoDB'ye kaydet
    const product = new Product({
      url,
      title,
      currentPrice: price,
      priceHistory: [{ price, date: new Date() }]
    });

    await product.save();
    res.json(product);
  } catch (err: any) {
    // Hata tipine göre mesaj
    if (err.message.includes("Fiyat bulunamadı")) {
      res.status(400).json({ error: "Fiyat bulunamadı!" });
    } else if (err.code === 11000) { // unique index hatası
      res.status(400).json({ error: "Ürün zaten mevcut." });
    } else {
      res.status(500).json({ error: "Ürün eklenirken bir hata oluştu." });
    }
  }
});

// Tüm ürünleri getir
router.get("/", async (_req, res) => {
  const products = await Product.find();
  res.json(products);
});

// Ürün sil
router.delete("/:id", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Ürün silindi" });
});

router.put("/:id/alarm", async (req, res) => {
  try {
    const { alarmPrice } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Ürün bulunamadı" });

    product.alarmPrice = alarmPrice;
    await product.save();

    res.json({ message: "Alarm fiyatı güncellendi", product });
  } catch (err) {
    res.status(500).json({ error: "Alarm fiyatı güncellenemedi" });
  }
});

export default router;
