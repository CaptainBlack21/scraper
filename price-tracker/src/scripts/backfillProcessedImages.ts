// scripts/backfillProcessedImages.ts
import "dotenv/config";
import mongoose from "mongoose";
import Product from "../models/Product";
import ProcessedProduct from "../models/ProcessedProduct";

const BATCH_SIZE = 500;

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI yok");
  await mongoose.connect(uri as string, { serverSelectionTimeoutMS: 8000 } as any);
  console.log("✅ Mongo bağlandı");

  // image alanı olmayan veya boş olan processed kayıtlar
  const query = {
    $or: [{ image: { $exists: false } }, { image: null }, { image: "" }],
  } as any;

  let totalFixed = 0;
  let scanned = 0;

  while (true) {
    const items = await ProcessedProduct.find(query)
      .select({ _id: 1, productId: 1 })
      .limit(BATCH_SIZE)
      .lean();

    if (!items.length) break;

    // productId -> processed[] map
    const byProductId = new Map<string, string[]>();
    for (const it of items) {
      scanned++;
      if (!it.productId) continue;
      const arr = byProductId.get(it.productId) || [];
      arr.push(String(it._id));
      byProductId.set(it.productId, arr);
    }

    // İlgili ürünleri topla
    const productIds = Array.from(byProductId.keys());
    const products = await Product.find({ _id: { $in: productIds } })
      .select({ _id: 1, image: 1 })
      .lean();

    // Güncellenecek processed id’leri ve image url’leri
    const ops: any[] = [];
    for (const p of products) {
      if (p?.image && typeof p.image === "string" && p.image.trim()) {
        const ids = byProductId.get(String(p._id)) || [];
        if (ids.length) {
          ops.push({
            updateMany: {
              filter: { _id: { $in: ids } },
              update: { $set: { image: p.image } },
            },
          });
        }
      }
    }

    if (ops.length) {
      const res = await (ProcessedProduct as any).bulkWrite(ops, { ordered: false });
      const modified =
        (res?.modifiedCount ?? 0) +
        Object.values(res || {}).reduce((acc: number, v: any) => acc + (v?.modifiedCount ?? 0), 0);
      totalFixed += modified;
      console.log(`📦 batch: scanned=${scanned}, fixed+=${modified} (total=${totalFixed})`);
    } else {
      console.log(`📦 batch: scanned=${scanned}, fixed+=0 (total=${totalFixed})`);
    }

    // Döngü: bir sonraki batch için devam
  }

  console.log(`✅ Bitti. Toplam güncellenen processed.image: ${totalFixed}`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error("❌ backfill hata:", e);
  process.exit(1);
});
