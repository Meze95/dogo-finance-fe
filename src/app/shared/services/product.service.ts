import { Injectable, signal } from '@angular/core';
import { Product, ProductType, AssetType, ProductAssetAllocation } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // Mock Data
  productTypes = signal<ProductType[]>([
    { productTypeId: 'PT-01', name: 'Fixed Income Fund', supportsAllocation: true, supportsProfitSharing: false, createdAt: new Date() },
    { productTypeId: 'PT-02', name: 'Balanced Fund', supportsAllocation: true, supportsProfitSharing: true, createdAt: new Date() }
  ]);

  assetTypes = signal<AssetType[]>([
    { assetTypeId: 'AT-01', name: 'FGN Sukuk', isShariahCompliant: true, createdAt: new Date() },
    { assetTypeId: 'AT-02', name: 'Shariah Compliant Fixed Term', isShariahCompliant: true, createdAt: new Date() },
    { assetTypeId: 'AT-03', name: 'Islamic Liquidity', isShariahCompliant: true, createdAt: new Date() },
    { assetTypeId: 'AT-04', name: 'Nigerian Equities', isShariahCompliant: true, createdAt: new Date() }
  ]);

  products = signal<Product[]>([
    { 
      productId: 'P-01', name: 'Shariah Fixed Income Fund', productTypeId: 'PT-01', 
      riskLevel: 'Low', description: 'Low risk Shariah-compliant fund focused on Sukuk.', 
      isActive: true, tenor: '1-3 Years', rate: 12.5, createdAt: new Date(),
      allocations: [
        { id: 'A-01', productId: 'P-01', assetTypeId: 'AT-01', assetTypeName: 'FGN Sukuk (Medium–Long Tenor)', targetPercentage: 80, minPercentage: 70, maxPercentage: 100 },
        { id: 'A-02', productId: 'P-01', assetTypeId: 'AT-02', assetTypeName: 'Shariah Compliant Fixed Term', targetPercentage: 15, minPercentage: 0, maxPercentage: 25 },
        { id: 'A-03', productId: 'P-01', assetTypeId: 'AT-03', assetTypeName: 'Islamic Liquidity (Murabaha / Cash)', targetPercentage: 5, minPercentage: 0, maxPercentage: 5 }
      ]
    },
    { 
      productId: 'P-02', name: 'Shariah Balanced Fund', productTypeId: 'PT-02', 
      riskLevel: 'Medium', description: 'Balanced fund including Sukuk and Shariah Equities.', 
      isActive: true, tenor: '3-5 Years', rate: 15.0, createdAt: new Date(),
      allocations: [
        { id: 'A-04', productId: 'P-02', assetTypeId: 'AT-01', assetTypeName: 'FGN Sukuk', targetPercentage: 70, minPercentage: 70, maxPercentage: 100 },
        { id: 'A-05', productId: 'P-02', assetTypeId: 'AT-04', assetTypeName: 'Shariah-Compliant Nigerian Equities', targetPercentage: 10, minPercentage: 0, maxPercentage: 30 },
        { id: 'A-06', productId: 'P-02', assetTypeId: 'AT-02', assetTypeName: 'Shariah Compliant Fixed Term', targetPercentage: 15, minPercentage: 0, maxPercentage: 25 },
        { id: 'A-07', productId: 'P-02', assetTypeId: 'AT-03', assetTypeName: 'Islamic Liquidity (Murabaha / Cash)', targetPercentage: 5, minPercentage: 0, maxPercentage: 5 }
      ]
    }
  ]);

  getAssetTypeName(id: string) {
    return this.assetTypes().find(a => a.assetTypeId === id)?.name || 'Unknown Asset';
  }

  // Update or Create Product
  saveProduct(product: Product) {
    const list = this.products();
    const index = list.findIndex(p => p.productId === product.productId);
    if (index >= 0) {
      list[index] = { ...product };
      this.products.set([...list]);
    } else {
      this.products.update(p => [...p, { ...product, productId: 'P-' + (p.length + 1) }]);
    }
  }

  deleteProduct(id: string) {
    this.products.update(list => list.filter(p => p.productId !== id));
  }

  // Manage Product Types
  saveProductType(type: ProductType) {
    const list = this.productTypes();
    const index = list.findIndex(t => t.productTypeId === type.productTypeId);
    if (index >= 0) {
      list[index] = { ...type };
      this.productTypes.set([...list]);
    } else {
      this.productTypes.update(t => [...t, { ...type, productTypeId: 'PT-' + (t.length + 1) }]);
    }
  }

  deleteProductType(id: string) {
    this.productTypes.update(list => list.filter(t => t.productTypeId !== id));
  }

  // Manage Asset Types
  saveAssetType(type: AssetType) {
    const list = this.assetTypes();
    const index = list.findIndex(t => t.assetTypeId === type.assetTypeId);
    if (index >= 0) {
      list[index] = { ...type };
      this.assetTypes.set([...list]);
    } else {
      this.assetTypes.update(t => [...t, { ...type, assetTypeId: 'AT-' + (t.length + 1) }]);
    }
  }

  deleteAssetType(id: string) {
    this.assetTypes.update(list => list.filter(t => t.assetTypeId !== id));
  }
}
