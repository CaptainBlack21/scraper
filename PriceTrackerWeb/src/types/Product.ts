export interface IProduct {
  _id: string;
  title: string;
  url: string;
  currentPrice: number;
  priceHistory: { price: number; date: string }[];
  alarmPrice: number;
  image?: string | null;
  stockStatus?: string | null;  // ✅ yeni alan
  lastEtag?: string | null;
  lastModified?: string | null;
  shardMinute: number;
  cooldownUntil?: string | null;
  lastCheckedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
