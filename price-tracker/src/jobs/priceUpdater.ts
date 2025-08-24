import cron from "node-cron";
import nodemailer from "nodemailer";
import Product from "../models/Product";
import { scrapeAmazonProduct } from "../services/scraper";

// Nodemailer transporter ayarı
const transporter = nodemailer.createTransport({
  service: "gmail", // Gmail kullanıyorsan
  auth: {
    user: "omeryagmur666@gmail.com", // kendi mailin
    pass: "jcvo chhv bbry jole", 
  },
});

// Alarm mail gönderme fonksiyonu
const sendAlarmEmail = async (productTitle: string, price: number) => {
  const mailOptions = {
    from: "omeryagmur666@gmail.com",
    to: "omeryyagmur@gmail.com", // alarm e-maili alacak kişi
    subject: `🔔 Fiyat Alarmı: ${productTitle}`,
    text: `${productTitle} ürünü alarm fiyatına düştü. Şu anki fiyat: ${price} TL`,
  };

  await transporter.sendMail(mailOptions);
};

// Her 30 dakikada bir çalışır
cron.schedule("*/30 * * * *", async () => {
  console.log("🔄 Fiyat güncelleme başladı...");
  const products = await Product.find();

  for (const product of products) {
    try {
      const { price } = await scrapeAmazonProduct(product.url);

      if (price !== product.currentPrice) {
        product.currentPrice = price;

        // History’ye ekle (max 4 kayıt)
        product.priceHistory.push({ price, date: new Date() });
        if (product.priceHistory.length > 4) {
          product.priceHistory.shift();
        }

        product.lastUpdated = new Date();
        await product.save();

        console.log(`✅ ${product.title} fiyat güncellendi: ${price}`);

        // Alarm kontrolü ve mail gönderme
        if (product.alarmPrice > 0 && price <= product.alarmPrice) {
          console.log(
            `🔔 ALARM! ${product.title} fiyatı ${price} TL ile alarm fiyatının altında!`
          );
          try {
            await sendAlarmEmail(product.title, price);
            console.log("📧 Alarm e-postası gönderildi");
          } catch (err: any) {
            console.error("❌ Mail gönderilemedi:", err.message);
          }
        }
      }
    } catch (err: any) {
      console.error(`❌ ${product.title} güncellenemedi:`, err.message);
    }
  }
});
