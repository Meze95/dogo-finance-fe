import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product, UserInvestment, InstrumentHolding, AssetInstrument, AdminUserInvestment } from '../models/product.model';
import { ProductService } from './product.service';
import { Observable, of, delay, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InvestmentService {
  private productService = inject(ProductService);

  // State
  userInvestments = signal<UserInvestment[]>([]);
  allInvestments = signal<AdminUserInvestment[]>([]);

  constructor() {
    this.productService.getProducts(); // Ensure products are loaded
    this.loadMockInvestments();
    this.loadAllAdminInvestments();
  }

  loadMockInvestments() {
    // Generate some mock investments based on existing products
    const products = this.productService.products();
    if (products.length === 0) return;

    const mock: UserInvestment[] = [
      {
        id: 1,
        productId: products[0].productId,
        productName: products[0].name,
        totalInvested: 1000000,
        currentValue: 1125000,
        growthPercentage: 12.5,
        status: 'active',
        investedAt: '2026-01-15',
        holdings: this.generateMockHoldings(products[0], 1000000)
      }
    ];
    this.userInvestments.set(mock);
  }

  private generateMockHoldings(product: Product, totalAmount: number): InstrumentHolding[] {
    const holdings: InstrumentHolding[] = [];
    if (!product.allocations) return holdings;

    product.allocations.forEach(alloc => {
      const assetAmount = totalAmount * (alloc.targetPercentage / 100);
      if (alloc.instruments) {
        alloc.instruments.forEach(instAlloc => {
          const instAmount = assetAmount * (instAlloc.percentage / 100);
          const instrument = this.productService.instruments().find(i => i.id === instAlloc.instrumentId);
          const price = instrument?.unitPrice || 100;
          
          holdings.push({
            id: Math.floor(Math.random() * 10000),
            instrumentId: instAlloc.instrumentId,
            instrumentName: instAlloc.instrumentName || 'Unknown',
            units: instAmount / price,
            purchasePrice: price,
            currentPrice: price * (1 + (Math.random() * 0.2 - 0.05)), // random growth
            allocationPercentage: (alloc.targetPercentage * instAlloc.percentage) / 100
          });
        });
      }
    });

    return holdings;
  }

  invest(productId: number, amount: number): Observable<any> {
    const product = this.productService.products().find(p => p.productId === productId);
    if (!product) return of({ success: false, message: 'Product not found' });

    const newInvestment: UserInvestment = {
      id: Math.floor(Math.random() * 10000),
      productId: product.productId,
      productName: product.name,
      totalInvested: amount,
      currentValue: amount,
      growthPercentage: 0,
      status: 'active',
      investedAt: new Date().toISOString().split('T')[0],
      holdings: this.generateMockHoldings(product, amount)
    };

    return of({ success: true }).pipe(
      delay(1500),
      tap(() => this.userInvestments.update(prev => [...prev, newInvestment]))
    );
  }

  exitPortfolio(investmentId: number): Observable<any> {
    return of({ success: true }).pipe(
      delay(1500),
      tap(() => {
        this.userInvestments.update(prev => 
          prev.map(inv => inv.id === investmentId ? { ...inv, status: 'exited' as const } : inv)
          .filter(inv => inv.status === 'active') // Remove from active list for simplicity in this UI
        );
      })
    );
  }

  liquidateEverything(): Observable<any> {
    return of({ success: true }).pipe(
      delay(2000),
      tap(() => {
        this.userInvestments.set([]);
      })
    );
  }

  sellInstrumentUnits(investmentId: number, holdingId: number, units: number): Observable<any> {
    return of({ success: true }).pipe(
      delay(1000),
      tap(() => {
        this.userInvestments.update(prev => {
          return prev.map(inv => {
            if (inv.id !== investmentId) return inv;
            const newHoldings = inv.holdings.map(h => {
              if (h.id !== holdingId) return h;
              return { ...h, units: Math.max(0, h.units - units) };
            }).filter(h => h.units > 0);
            
            // Recalculate total value
            const newVal = newHoldings.reduce((sum, h) => sum + (h.units * h.currentPrice), 0);
            return { ...inv, holdings: newHoldings, currentValue: newVal };
          }).filter(inv => inv.holdings.length > 0);
        });
      })
    );
  }

  loadAllAdminInvestments() {
    const products = this.productService.products();
    if (products.length === 0) {
      setTimeout(() => this.loadAllAdminInvestments(), 500);
      return;
    }

    const p0 = products[0];
    const p1 = products[1] || products[0];
    const p2 = products[2] || products[0];

    const mock: AdminUserInvestment[] = [
      {
        id: 101,
        productId: p0.productId,
        productName: p0.name,
        totalInvested: 2500000,
        currentValue: 2850000,
        growthPercentage: 14.0,
        status: 'active',
        investedAt: '2026-02-10',
        holdings: this.generateMockHoldings(p0, 2500000),
        clientName: 'Zubair Al-Farooq',
        clientEmail: 'zubair@example.com',
        clientInitials: 'ZF'
      },
      {
        id: 102,
        productId: p1.productId,
        productName: p1.name,
        totalInvested: 5000000,
        currentValue: 5300000,
        growthPercentage: 6.0,
        status: 'active',
        investedAt: '2026-03-01',
        holdings: this.generateMockHoldings(p1, 5000000),
        clientName: 'Halima Ibrahim',
        clientEmail: 'halima@example.com',
        clientInitials: 'HI'
      },
      {
        id: 103,
        productId: p2.productId,
        productName: p2.name,
        totalInvested: 1200000,
        currentValue: 1250000,
        growthPercentage: 4.1,
        status: 'active',
        investedAt: '2026-03-15',
        holdings: this.generateMockHoldings(p2, 1200000),
        clientName: 'Abubakar Sadiq',
        clientEmail: 'sadiq@example.com',
        clientInitials: 'AS'
      }
    ];
    this.allInvestments.set(mock);
  }
}
