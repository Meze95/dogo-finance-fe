export interface ProductType {
  productTypeId: number;
  name: string;
  code: string;
  supportsAllocation: boolean;
  supportsProfitSharing: boolean;
  createdAt?: Date;
}

export interface Product {
  productId: number;
  name: string;
  code: string;
  productTypeId: number;
  riskLevel: string;
  description: string;
  isActive: boolean;
  minTenorInDays?: number;
  maxTenorInDays?: number;
  createdAt?: Date;
  allocations?: ProductAssetAllocation[];
  productTypeName?: string;
}

export interface AssetType {
  assetTypeId: number;
  name: string;
  code: string;
  isShariahCompliant: boolean;
  createdAt?: Date;
}

export interface ProductAssetAllocation {
  id: number;
  productId: number;
  assetTypeId: number;
  assetTypeName?: string; // For UI display
  targetPercentage: number;
  minPercentage: number;
  maxPercentage: number;
}
