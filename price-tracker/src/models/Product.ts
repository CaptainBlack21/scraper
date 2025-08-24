import mongoose, { Schema, Document } from "mongoose";

interface PriceHistory {
  price: number;
  date: Date;
}

export interface IProduct extends Document {
  url: string;
  title: string;
  currentPrice: number;
  priceHistory: PriceHistory[];
  lastUpdated: Date;
  alarmPrice: number;
}

const productSchema = new Schema<IProduct>({
  url: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  currentPrice: { type: Number, required: true },
  priceHistory: [
    {
      price: Number,
      date: { type: Date, default: Date.now }
    }
  ],
  lastUpdated: { type: Date, default: Date.now },
  alarmPrice: { type: Number, default: 0 } // 0 = alarm kapalı
});

export default mongoose.model<IProduct>("Product", productSchema);
