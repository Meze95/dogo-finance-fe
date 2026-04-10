import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Product, ProductType, AssetType, AssetInstrument } from '../models/product.model';
import { Observable, of, delay, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  public apiUrl = environment.apiUrl;

  // State Management via Signals
  products = signal<Product[]>([]);
  productTypes = signal<ProductType[]>([]);
  assetTypes = signal<AssetType[]>([]);
  instruments = signal<AssetInstrument[]>([]);

  constructor() {
    this.refreshAll();
  }

  refreshAll() {
    this.getProductTypes();
    this.getAssetTypes();
    this.getInstruments();
    this.getProducts();
  }

  // Fetching Data (MOCKED)
  getProductTypes() {
    const mockTypes: ProductType[] = [
      { productTypeId: 1, name: 'Wealth Management', code: 'WM', supportsAllocation: true, supportsProfitSharing: false },
      { productTypeId: 2, name: 'Term Deposits', code: 'TD', supportsAllocation: false, supportsProfitSharing: true },
      { productTypeId: 3, name: 'Ethical Investing', code: 'EI', supportsAllocation: true, supportsProfitSharing: false }
    ];
    this.productTypes.set(mockTypes);
  }

  getAssetTypes() {
    const mockAssets: AssetType[] = [
      { assetTypeId: 1, name: 'Global Equities', code: 'GE', isShariahCompliant: true },
      { assetTypeId: 2, name: 'Commodities', code: 'CM', isShariahCompliant: true },
      { assetTypeId: 3, name: 'Sukuk', code: 'SK', isShariahCompliant: true },
      { assetTypeId: 4, name: 'Cash', code: 'CS', isShariahCompliant: true }
    ];
    this.assetTypes.set(mockAssets);
  }

  getInstruments() {
    const mockInstruments: AssetInstrument[] = [
      { id: 1, name: 'Vanguard World Stock ETF', unitPrice: 105.5, assetTypeId: 1, assetTypeName: 'Global Equities' },
      { id: 2, name: 'iShares Core MSCI World', unitPrice: 85.2, assetTypeId: 1, assetTypeName: 'Global Equities' },
      { id: 3, name: 'SPDR Gold Trust', unitPrice: 195.0, assetTypeId: 2, assetTypeName: 'Commodities' },
      { id: 4, name: 'Aberdeen Physical Silver', unitPrice: 24.5, assetTypeId: 2, assetTypeName: 'Commodities' },
      { id: 5, name: 'Franklin Gulf Sukuk Fund', unitPrice: 10.2, assetTypeId: 3, assetTypeName: 'Sukuk' },
      { id: 6, name: 'HSBC Sukuk Fund', unitPrice: 12.5, assetTypeId: 3, assetTypeName: 'Sukuk' },
      { id: 7, name: 'Standard Chartered Murabaha', unitPrice: 1.0, assetTypeId: 4, assetTypeName: 'Cash' }
    ];
    this.instruments.set(mockInstruments);
  }

  getProducts() {
    const mockProducts: Product[] = [
      {
        productId: 1,
        name: 'Halal Growth Portfolio',
        code: 'HGP-001Token',
        productTypeId: 1,
        productTypeName: 'Wealth Management',
        riskLevel: 'High',
        description: 'A diversified portfolio of global equities and commodities.',
        isActive: true,
        allocations: [
          {
            id: 1, productId: 1, assetTypeId: 1, assetTypeName: 'Global Equities', targetPercentage: 70, minPercentage: 60, maxPercentage: 80,
            instruments: [
              { id: 1, instrumentId: 1, instrumentName: 'Vanguard World Stock ETF', percentage: 70 },
              { id: 2, instrumentId: 2, instrumentName: 'iShares Core MSCI World', percentage: 30 }
            ]
          },
          {
            id: 2, productId: 1, assetTypeId: 2, assetTypeName: 'Commodities', targetPercentage: 30, minPercentage: 20, maxPercentage: 40,
            instruments: [
              { id: 3, instrumentId: 3, instrumentName: 'SPDR Gold Trust', percentage: 100 }
            ]
          }
        ]
      },
      {
        productId: 2,
        name: 'Agri-Sukuk Al-Murabaha',
        code: 'AGS-2026',
        productTypeId: 3,
        productTypeName: 'Ethical Investing',
        riskLevel: 'Medium',
        description: 'Investment in agricultural processing and trade finance.',
        isActive: true,
        allocations: [
          {
            id: 3, productId: 2, assetTypeId: 3, assetTypeName: 'Sukuk', targetPercentage: 100, minPercentage: 90, maxPercentage: 100,
            instruments: [
              { id: 5, instrumentId: 5, instrumentName: 'Franklin Gulf Sukuk Fund', percentage: 100 }
            ]
          }
        ]
      },
      {
        productId: 3,
        name: 'Real Estate Alpha Pool',
        code: 'RE-ALPHA',
        productTypeId: 3,
        productTypeName: 'Ethical Investing',
        riskLevel: 'Medium',
        description: 'Direct exposure to shariah-compliant residential developments.',
        isActive: true,
        allocations: [
          {
             id: 4, productId: 3, assetTypeId: 4, assetTypeName: 'Cash', targetPercentage: 100, minPercentage: 100, maxPercentage: 100,
             instruments: [
               { id: 7, instrumentId: 7, instrumentName: 'Standard Chartered Murabaha', percentage: 100 }
             ]
          }
        ]
      }
    ];
    this.products.set(mockProducts);
  }

  // Management Methods (MOCKED)
  saveProductType(type: ProductType): Observable<any> {
    if (!type.productTypeId) type.productTypeId = Math.floor(Math.random() * 1000);
    const current = this.productTypes();
    const index = current.findIndex(t => t.productTypeId === type.productTypeId);
    if (index > -1) {
      current[index] = type;
      this.productTypes.set([...current]);
    } else {
      this.productTypes.set([...current, type]);
    }
    return of({ success: true, message: 'Type saved successfully' }).pipe(delay(500));
  }

  deleteProductType(id: number): Observable<any> {
    this.productTypes.set(this.productTypes().filter(t => t.productTypeId !== id));
    return of({ success: true, message: 'Type deleted successfully' }).pipe(delay(500));
  }

  saveAssetType(asset: AssetType): Observable<any> {
    if (!asset.assetTypeId) asset.assetTypeId = Math.floor(Math.random() * 1000);
    const current = this.assetTypes();
    const index = current.findIndex(t => t.assetTypeId === asset.assetTypeId);
    if (index > -1) {
      current[index] = asset;
      this.assetTypes.set([...current]);
    } else {
      this.assetTypes.set([...current, asset]);
    }
    return of({ success: true, message: 'Asset Class saved successfully' }).pipe(delay(500));
  }

  deleteAssetType(id: number): Observable<any> {
    this.assetTypes.set(this.assetTypes().filter(t => t.assetTypeId !== id));
    return of({ success: true, message: 'Asset Class deleted successfully' }).pipe(delay(500));
  }

  saveInstrument(instrument: AssetInstrument): Observable<any> {
    if (!instrument.id) instrument.id = Math.floor(Math.random() * 1000);
    const asset = this.assetTypes().find(a => a.assetTypeId === instrument.assetTypeId);
    instrument.assetTypeName = asset?.name;
    const current = this.instruments();
    const index = current.findIndex(t => t.id === instrument.id);
    if (index > -1) {
      current[index] = instrument;
      this.instruments.set([...current]);
    } else {
      this.instruments.set([...current, instrument]);
    }
    return of({ success: true, message: 'Instrument saved successfully' }).pipe(delay(500));
  }

  deleteInstrument(id: number): Observable<any> {
    this.instruments.set(this.instruments().filter(t => t.id !== id));
    return of({ success: true, message: 'Instrument deleted successfully' }).pipe(delay(500));
  }

  saveProduct(product: Product): Observable<any> {
    if (!product.productId) product.productId = Math.floor(Math.random() * 1000);
    const type = this.productTypes().find(t => t.productTypeId === product.productTypeId);
    product.productTypeName = type?.name;
    const current = this.products();
    const index = current.findIndex(t => t.productId === product.productId);
    if (index > -1) {
      current[index] = product;
      this.products.set([...current]);
    } else {
      this.products.set([...current, product]);
    }
    return of({ success: true, message: 'Product saved successfully' }).pipe(delay(500));
  }

  deleteProduct(id: number): Observable<any> {
    this.products.set(this.products().filter(t => t.productId !== id));
    return of({ success: true, message: 'Product deleted successfully' }).pipe(delay(500));
  }
}
