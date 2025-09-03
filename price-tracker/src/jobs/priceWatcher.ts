import cron from "node-cron";
import nodemailer from "nodemailer";
import Product from "../models/Product";
import ProcessedProduct from "../models/ProcessedProduct";
import { scrapeAmazonProduct } from "../services/scraper";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const jitter = (a: number, b: number) => a + Math.floor(Math.random() * (b - a));

const TARGET_RPS = Number(process.env.TARGET_RPS || "0.5");
const perRequestMs = Math.max(200, Math.floor(1000 / TARGET_RPS));

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

async function sendAlarmEmail(title: string, price: number) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_TO,
    subject: `🔔 Fiyat Alarmı: ${title}`,
    text: `${title} alarm fiyatına düştü. Şu an: ${price} TL`,
  });
}

export function startPriceWatcher() {
  cron.schedule("* * * * *", async () => {
    const now = new Date();
    const minute = now.getMinutes();
    console.log(`⏱️ ${now.toISOString()} | dakika shard=${minute}`);

    const candidates = await Product.find({
      shardMinute: minute,
      $or: [{ cooldownUntil: null }, { cooldownUntil: { $lte: now } }],
    });

    candidates.sort(() => Math.random() - 0.5);
    console.log(`🎯 Bu dakika işlenecek: ${candidates.length}`);

    for (const product of candidates) {
      const t0 = Date.now();
      try {
        const res = await scrapeAmazonProduct(product.url, {
          etag: product.lastEtag || undefined,
          lastModified: product.lastModified || undefined,
        });

        if (res.notModified) {
          // İçerik değişmemiş → sadece meta güncelle
          product.lastEtag = res.etag ?? product.lastEtag;
          product.lastModified = res.lastModified ?? product.lastModified;
          product.lastCheckedAt = new Date();
          await product.save();
          // ❗ KAYIT ALMIYORUZ (senin isteğin)
          continue;
        }

        if (typeof res.price === "number") {
          const prev = product.currentPrice ?? 0;
          const next = res.price;

          if (next !== prev) {
            // fiyat değişti → ürün ve tarihçe güncelle
            product.currentPrice = next;
            product.priceHistory = product.priceHistory || [];
            product.priceHistory.push({ price: next, date: new Date() });
            if (product.priceHistory.length > 4) product.priceHistory.shift();

            if (product.alarmPrice > 0 && next <= product.alarmPrice) {
              try { await sendAlarmEmail(product.title ?? "Ürün", next); }
              catch (e: any) { console.error("📧 Mail hatası:", e?.message || e); }
            }
            console.log(`✅ ${product.title} → ${next}`);
          }

          product.lastEtag = res.etag ?? product.lastEtag;
          product.lastModified = res.lastModified ?? product.lastModified;
          product.lastCheckedAt = new Date();
          await product.save();

          // ❗ SADECE FİYAT DEĞİŞTİYSE KAYDET
          if (next !== prev) {
            const diff = next - prev;
            const diffPct = prev > 0 ? (diff / prev) * 100 : 0;
            const direction: "up" | "down" | "same" =
              diff > 0 ? "up" : diff < 0 ? "down" : "same";

            await new ProcessedProduct({
              productId: product._id.toString(),
              title: product.title ?? "Ürün",
              url: product.url,
              prevPrice: prev,
              newPrice: next,
              diff,
              diffPct,
              direction,
              processedAt: new Date(),
            }).save();
          }
        }
      } catch (e: any) {
        if (e?.name === "AntiBotError") {
          const mins = 10 + Math.floor(Math.random() * 20);
          product.cooldownUntil = new Date(Date.now() + mins * 60 * 1000);
          await product.save();
          console.warn(`🧊 Anti-bot: ${product.title} → ${mins} dk cooldown`);
        } else {
          console.error(`❌ ${product.title} hata:`, e?.message || e);
        }
      } finally {
        const elapsed = Date.now() - t0;
        const wait = Math.max(0, perRequestMs - elapsed) + jitter(80, 420);
        await sleep(wait);
      }
    }

    console.log("✅ Dakikalık parti bitti.");
  });
}
