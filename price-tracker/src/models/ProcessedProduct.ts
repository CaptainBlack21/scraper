// src/models/ProcessedProduct.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface ProcessedDoc extends Document {
  productId: Types.ObjectId; // ✅ Artık ObjectId
  title: string;
  url?: string;
  image?: string;

  prevPrice: number;
  newPrice: number;
  diff: number;
  diffPct: number;
  direction: "up" | "down" | "same";

  processedAt: Date;
}

const ProcessedSchema = new Schema<ProcessedDoc>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true }, // ✅
    title: { type: String, required: true },
    url: { type: String },
    image: { type: String },

    prevPrice: { type: Number, required: true },
    newPrice: { type: Number, required: true },
    diff: { type: Number, required: true },
    diffPct: { type: Number, required: true },
    direction: { type: String, enum: ["up", "down", "same"], required: true },

    processedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export default mongoose.models.ProcessedProduct ||
  mongoose.model<ProcessedDoc>("ProcessedProduct", ProcessedSchema);
