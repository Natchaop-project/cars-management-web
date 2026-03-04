export type CarItem = {
  id: string;
  importId: string;
  brand: string;
  model: string;
  year: number;
  salePrice: number | null;
  forsale: boolean;
  userId: string | null;
  ownerName: string;
  createdAtText: string;
};

export type FirestoreCarDoc = {
  importId?: string;
  brand?: string;
  model?: string;
  year?: number;
  salePrice?: number;
  saleprice?: number;
  forsale?: boolean;
  Forsale?: boolean;
  userId?: string | null;
  isHidden?: boolean;
  createdAt?: {
    toDate?: () => Date;
  };
};

export type FirestoreUserDoc = {
  name?: string;
};

export type BrandChartItem = {
  brand: string;
  count: number;
};

export type CarRecord = {
  brand: string;
  model: string;
  year: number | null;
  salePrice: number | null;
};

export type ModelChartItem = {
  model: string;
  count: number;
};

export type ModelYearPriceChartItem = {
  year: number;
  salePrice: number;
};