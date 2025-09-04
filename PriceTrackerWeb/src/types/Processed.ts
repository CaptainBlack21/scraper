export interface IProcessed {
  _id: string;
  productId: string;
  title: string;
  url?: string;
  image?: string; // ✅ Yeni

  prevPrice: number;
  newPrice: number;
  diff: number;
  diffPct: number;
  direction: "up" | "down" | "same";

  processedAt: string;
}
