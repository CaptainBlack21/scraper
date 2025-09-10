import "dotenv/config";
import mongoose from "mongoose";
import ProcessedProduct from "../models/ProcessedProduct";

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI yok");

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 } as any);
  console.log("✅ Mongo bağlandı");

  const cursor = ProcessedProduct.find({ productId: { $type: "string" } }).cursor();
  let fixed = 0;

  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    try {
      const strId = doc.productId as unknown as string;
      const objId = new mongoose.Types.ObjectId(strId);
      doc.productId = objId as any;
      await doc.save();
      fixed++;
    } catch (e: any) {
      console.error("⚠️ Çevrilemedi:", doc._id, doc.productId, e?.message);
    }
  }

  console.log(`✅ Migration bitti. Güncellenen kayıt sayısı: ${fixed}`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error("❌ Migration hata:", e);
  process.exit(1);
});
