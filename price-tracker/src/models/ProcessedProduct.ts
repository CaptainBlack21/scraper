import mongoose, { Schema, Document } from "mongoose";

export interface ProcessedDoc extends Document {
  productId: string;
  title: string;
  url?: string;

  prevPrice: number;   // önceki fiyat
  newPrice: number;    // yeni fiyat
  diff: number;        // new - prev
  diffPct: number;     // yüzde fark (negatif düşüş)
  direction: "up" | "down" | "same";

  processedAt: Date;
}

const ProcessedSchema = new Schema<ProcessedDoc>(
  {
    productId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    url: { type: String },

    prevPrice: { type: Number, required: true },
    newPrice: { type: Number, required: true },
    diff: { type: Number, required: true },
    diffPct: { type: Number, required: true },
    direction: { type: String, enum: ["up", "down", "same"], required: true },

    processedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

// (opsiyonel) 7 gün sonra otomatik temizle
// ProcessedSchema.index({ processedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });

export default mongoose.models.ProcessedProduct ||
  mongoose.model<ProcessedDoc>("ProcessedProduct", ProcessedSchema);
