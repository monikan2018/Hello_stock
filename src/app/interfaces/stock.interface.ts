export interface Stock {
  id?: string;
  symbol: string;
  name: string;
  currentPrice: number;
  high24h: number;
  low24h: number;
  priceChange24h: number;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
} 