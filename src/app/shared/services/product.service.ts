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
  portfolios = signal<Product[]>([]);
  portfolioTypes = signal<ProductType[]>([]);
  assetTypes = signal<AssetType[]>([]);
  instruments = signal<AssetInstrument[]>([]);

  constructor() {
    this.refreshAll();
  }

  refreshAll() {
    this.getPortfolioTypes();
    this.getAssetTypes();
    this.getInstruments();
    this.getPortfolios();
  }

  getPortfolioTypes() {
    this.http.get<any>(`${this.apiUrl}/Portfolio/types`).subscribe(res => {
      if (res.success) {
        const mappedData = res.data.map((t: any) => ({
          ...t,
          portfolioTypeId: t.portfolioTypeId // Ensure casing/name matches frontend expectation
        }));
        this.portfolioTypes.set(mappedData);
      }
    });
  }

  getAssetTypes() {
    this.http.get<any>(`${this.apiUrl}/Portfolio/asset-classes`).subscribe(res => {
      if (res.success) {
        const mappedData = res.data.map((a: any) => ({
          ...a,
          assetTypeId: a.assetTypeId || a.assetClassId // Map assetClassId if it's named that from backend
        }));
        this.assetTypes.set(mappedData);
      }
    });
  }

  getInstruments() {
    this.http.get<any>(`${this.apiUrl}/Portfolio/instruments`).subscribe(res => {
      if (res.success) {
        // Map backend DTO names to frontend model names
        const mappedData = res.data.map((i: any) => ({
          ...i,
          id: i.instrumentId,
          assetTypeId: i.assetClassId
        }));
        this.instruments.set(mappedData);
      }
    });
  }

  getPortfolios() {
    this.http.get<any>(`${this.apiUrl}/Portfolio`).subscribe(res => {
      if (res.success) {
        const mappedData = res.data.map((p: any) => ({
          ...p,
          portfolioId: p.portfolioId,
          allocations: (p.allocations || []).map((a: any) => ({
            ...a,
            assetTypeName: a.assetClassName || a.assetTypeName
          }))
        }));
        this.portfolios.set(mappedData);
      }
    });
  }

  savePortfolioType(type: ProductType): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Portfolio/types`, type).pipe(
      tap(res => {
        if (res.success) this.getPortfolioTypes();
      })
    );
  }

  deletePortfolioType(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/Portfolio/types/${id}`).pipe(
      tap(res => {
        if (res.success) this.getPortfolioTypes();
      })
    );
  }

  saveAssetType(asset: AssetType): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Portfolio/asset-classes`, asset).pipe(
      tap(res => {
        if (res.success) this.getAssetTypes();
      })
    );
  }

  deleteAssetType(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/Portfolio/asset-classes/${id}`).pipe(
      tap(res => {
        if (res.success) this.getAssetTypes();
      })
    );
  }

  saveInstrument(instrument: AssetInstrument): Observable<any> {
    const instrumentDto = {
      instrumentId: instrument.id,
      name: instrument.name,
      code: instrument.code,
      assetClassId: instrument.assetTypeId,
      unitPrice: instrument.unitPrice,
      priceDate: instrument.priceDate,
      priceSource: instrument.priceSource,
      isActive: true
    };
    return this.http.post<any>(`${this.apiUrl}/Portfolio/instruments`, instrumentDto).pipe(
      tap(res => {
        if (res.success) this.getInstruments();
      })
    );
  }

  deleteInstrument(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/Portfolio/instruments/${id}`).pipe(
      tap(res => {
        if (res.success) this.getInstruments();
      })
    );
  }

  savePortfolio(portfolio: Product): Observable<any> {
    // Explicitly map frontend model names to backend DTO names
    const portfolioDto = {
      portfolioId: portfolio.portfolioId,
      name: portfolio.name,
      code: portfolio.code,
      portfolioTypeId: portfolio.portfolioTypeId,
      riskLevel: portfolio.riskLevel,
      description: portfolio.description,
      expectedAnnualReturn: portfolio.expectedAnnualReturn || 0,
      isActive: portfolio.isActive,
      lockInPeriodDays: portfolio.lockInPeriodDays || 0,
      minHoldingPeriodDays: portfolio.minHoldingPeriodDays || 0,
      exitFeePercentage: portfolio.exitFeePercentage || 0,
      noticePeriodDays: portfolio.noticePeriodDays || 0,
      approvalThresholdAmount: portfolio.approvalThresholdAmount || 0,
      allocations: (portfolio.allocations || []).map(alloc => ({
        id: alloc.id,
        portfolioId: portfolio.portfolioId,
        assetClassId: alloc.assetTypeId, // Mapped to Backend name
        targetPercentage: alloc.targetPercentage,
        minPercentage: alloc.minPercentage,
        maxPercentage: alloc.maxPercentage,
        expectedReturn: 0, // Optional or calculated
        instruments: (alloc.instruments || []).map(inst => ({
          id: inst.id,
          portfolioId: portfolio.portfolioId,
          assetClassId: alloc.assetTypeId,
          instrumentId: inst.instrumentId,
          percentage: inst.percentage // Mapped to Backend name
        }))
      }))
    };

    return this.http.post<any>(`${this.apiUrl}/Portfolio`, portfolioDto).pipe(
      tap(res => {
        if (res.success) this.getPortfolios();
      })
    );
  }

  deletePortfolio(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/Portfolio/${id}`).pipe(
      tap(res => {
        if (res.success) this.getPortfolios();
      })
    );
  }
}
