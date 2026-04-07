export interface ProductType {
  productTypeId: string;
  name: string;
  code?: string;
  supportsAllocation: boolean;
  supportsProfitSharing: boolean;
  createdAt: Date;
}

export interface Product {
  productId: string;
  name: string;
  code?: string;
  productTypeId: string;
  riskLevel: string;
  description: string;
  isActive: boolean;
  tenor: string;
  rate: number;
  createdAt: Date;
  allocations?: ProductAssetAllocation[];
}

export interface AssetType {
  assetTypeId: string;
  name: string;
  code?: string;
  isShariahCompliant: boolean;
  createdAt: Date;
}

export interface ProductAssetAllocation {
  id: string;
  productId: string;
  assetTypeId: string;
  assetTypeName?: string; // For UI display
  targetPercentage: number;
  minPercentage: number;
  maxPercentage: number;
}
