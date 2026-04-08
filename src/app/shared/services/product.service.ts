import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Product, ProductType, AssetType } from '../models/product.model';
import { Observable, tap } from 'rxjs';

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

  constructor() {
    this.refreshAll();
  }

  refreshAll() {
    this.getProductTypes();
    this.getAssetTypes();
    this.getProducts();
  }

  // Fetching Data
  getProductTypes() {
    this.http.get<any>(`${this.apiUrl}/Product/types`).subscribe(res => {
      if (res.success) this.productTypes.set(res.data);
    });
  }

  getAssetTypes() {
    this.http.get<any>(`${this.apiUrl}/Product/asset-types`).subscribe(res => {
      if (res.success) this.assetTypes.set(res.data);
    });
  }

  getProducts() {
    this.http.get<any>(`${this.apiUrl}/Product`).subscribe(res => {
      if (res.success) this.products.set(res.data);
    });
  }

  // Management Methods (Now returning Observables for component handling)
  saveProductType(type: ProductType): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Product/types`, type).pipe(
      tap(res => {
        if (res.success) this.getProductTypes();
      })
    );
  }

  deleteProductType(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/Product/types/${id}`).pipe(
      tap(res => {
        if (res.success) this.getProductTypes();
      })
    );
  }

  saveAssetType(asset: AssetType): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Product/asset-types`, asset).pipe(
      tap(res => {
        if (res.success) this.getAssetTypes();
      })
    );
  }

  deleteAssetType(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/Product/asset-types/${id}`).pipe(
      tap(res => {
        if (res.success) this.getAssetTypes();
      })
    );
  }

  saveProduct(product: Product): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Product`, product).pipe(
      tap(res => {
        if (res.success) this.getProducts();
      })
    );
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/Product/${id}`).pipe(
      tap(res => {
        if (res.success) this.getProducts();
      })
    );
  }
}
