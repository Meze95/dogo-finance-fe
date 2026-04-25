import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product, UserInvestment, InstrumentHolding, AssetInstrument, AdminUserInvestment } from '../models/product.model';
import { ProductService } from './product.service';
import { Observable, of, delay, tap, map } from 'rxjs';
import { TransactionService } from './transaction.service';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InvestmentService {
  private http = inject(HttpClient);
  private productService = inject(ProductService);
  private transactionService = inject(TransactionService);
  private authService = inject(AuthService);

  // State
  userInvestments = signal<UserInvestment[]>([]);
  allInvestments = signal<AdminUserInvestment[]>([]);
  liquidationRequests = signal<any[]>([]);

  constructor() {
    this.productService.getPortfolios(); // Ensure portfolios are loaded
    this.loadRealInvestments();
    this.loadAllAdminInvestments();
    this.loadLiquidationRequests();
  }

  loadRealInvestments() {
    const customerId = this.authService.currentUser()?.CustomerId || this.authService.currentUser()?.customerId;
    if (!customerId) return;

    this.transactionService.getActiveInvestments(customerId).subscribe({
        next: (res: any) => {
            const data = res?.data || res?.Data || [];
            if (Array.isArray(data)) {
                const mapped: UserInvestment[] = data.map((inv: any) => ({
                    id: inv.portfolioId,
                    portfolioId: inv.portfolioId,
                    portfolioName: inv.portfolioName,
                    totalInvested: inv.investedAmount,
                    currentValue: inv.currentValue,
                    growthPercentage: inv.growth,
                    status: 'active',
                    investedAt: inv.investedAt || new Date().toISOString(),
                    lastToppedUp: inv.lastToppedUp,
                    batches: inv.batches,
                    holdings: [],
                    
                    // New Fields
                    lockInPeriodDays: inv.lockInPeriodDays,
                    minHoldingPeriodDays: inv.minHoldingPeriodDays,
                    exitFeePercentage: inv.exitFeePercentage,
                    noticePeriodDays: inv.noticePeriodDays,
                    approvalThresholdAmount: inv.approvalThresholdAmount
                }));
                this.userInvestments.set(mapped);
            }
        }
    });
  }

  getPortfolioHoldings(portfolioId: number): Observable<InstrumentHolding[]> {
    const customerId = this.authService.currentUser()?.CustomerId || this.authService.currentUser()?.customerId;
    if (!customerId) return of([]);

    return this.transactionService.getHoldings(customerId).pipe(
        tap(res => console.log('Holdings Raw:', res)),
        // The backend might return ALL holdings, we might need to filter by portfolio
        // but for now let's just return what matches the portfolio instruments if we have that info
        // Simple mapping:
        map((res: any) => {
            const data = res?.data || res?.Data || [];
            return data.map((h: any) => ({
                id: h.holdingId || h.HoldingId,
                instrumentId: h.instrumentId || h.InstrumentId,
                instrumentName: h.instrumentName || h.InstrumentName || 'Instrument',
                units: h.units || h.Units || 0,
                currentPrice: h.currentPrice || h.CurrentPrice || h.nav || 1.0,
                allocationPercentage: h.percentage || 0
            }));
        })
    );
  }

  private generateMockHoldings(portfolio: Product, totalAmount: number): InstrumentHolding[] {
    const holdings: InstrumentHolding[] = [];
    if (!portfolio.allocations) return holdings;

    portfolio.allocations.forEach(alloc => {
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
            currentPrice: price * (1 + (Math.random() * 0.2 - 0.05)),
            allocationPercentage: (alloc.targetPercentage * instAlloc.percentage) / 100
          });
        });
      }
    });

    return holdings;
  }

  invest(portfolioId: number, amount: number): Observable<any> {
    const portfolio = this.productService.portfolios().find(p => p.portfolioId === portfolioId);
    if (!portfolio) return of({ success: false, message: 'Portfolio not found' });

    const newInvestment: UserInvestment = {
      id: Math.floor(Math.random() * 10000),
      portfolioId: portfolio.portfolioId,
      portfolioName: portfolio.name,
      totalInvested: amount,
      currentValue: amount,
      growthPercentage: 0,
      status: 'active',
      investedAt: new Date().toISOString().split('T')[0],
      holdings: this.generateMockHoldings(portfolio, amount)
    };

    return of({ success: true }).pipe(
      delay(1500),
      tap(() => this.userInvestments.update(prev => [...prev, newInvestment]))
    );
  }

  sell(portfolioId: number, amount: number, pin?: string, otp?: string): Observable<any> {
    return this.transactionService.sell(portfolioId, amount, pin, otp).pipe(
        tap(() => this.loadRealInvestments())
    );
  }

  exitPortfolio(portfolioId: number, currentAmount: number, pin?: string, otp?: string): Observable<any> {
    return this.sell(portfolioId, currentAmount, pin, otp);
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
            
            const newVal = newHoldings.reduce((sum, h) => sum + (h.units * h.currentPrice), 0);
            return { ...inv, holdings: newHoldings, currentValue: newVal };
          }).filter(inv => inv.holdings.length > 0);
        });
      })
    );
  }

  loadAllAdminInvestments() {
    this.http.get<any>(`${environment.apiUrl}/Admin/portfolios/active`).subscribe({
      next: (res) => {
        const data = res?.data || res?.Data || [];
        if (Array.isArray(data)) {
          this.allInvestments.set(data);
        }
      },
      error: (err) => {
        console.error('Failed to load admin portfolios:', err);
      }
    });
  }

  loadLiquidationRequests() {
    this.http.get<any>(`${environment.apiUrl}/Admin/liquidations`).subscribe({
      next: (res) => {
        const data = res?.data || res?.Data || [];
        if (Array.isArray(data)) {
          this.liquidationRequests.set(data);
        }
      },
      error: (err) => {
        console.error('Failed to load liquidation requests:', err);
      }
    });
  }

  reviewLiquidation(requestId: number, approved: boolean, adminNotes: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/Admin/liquidations/review`, {
      requestId,
      approved,
      adminNotes
    }).pipe(
      tap(() => {
        this.loadLiquidationRequests();
        this.loadAllAdminInvestments();
      })
    );
  }
}
