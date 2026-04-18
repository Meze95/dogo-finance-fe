import { Component, signal, computed, inject, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../shared/services/product.service';
import { InvestmentService } from '../../../shared/services/investment.service';
import { Product, ProductAssetAllocation } from '../../../shared/models/product.model';

import { AlertService } from '../../../shared/services/alert.service';

declare var Swal: any;
declare var TradingView: any;

@Component({
  selector: 'app-client-portfolios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './portfolios.component.html',
  styleUrl: './portfolios.component.css'
})
export class ClientPortfoliosComponent implements OnInit, AfterViewInit, OnDestroy {
  private productService = inject(ProductService);
  private investmentService = inject(InvestmentService);
  private alertService = inject(AlertService);

  portfolios = this.productService.portfolios;
  activeFilter = signal<string>('All');
  
  activePortfolios = computed(() => {
    const all = this.portfolios().filter(p => p.isActive);
    const filter = this.activeFilter();
    if (filter === 'All') return all;
    return all.filter(p => p.riskLevel === filter);
  });

  selectedPortfolio = signal<Product | null>(null);
  showDetailModal = signal(false);

  // Investment State
  showInvestModal = signal(false);
  investAmount = signal<number>(100000);
  isProcessing = signal(false);

  ngOnInit() {
    this.productService.getPortfolios();
  }

  ngAfterViewInit() {
    this.loadTradingViewWidgets();
  }

  ngOnDestroy() {
    // Cleanup if necessary
  }

  private loadTradingViewWidgets() {
    this.loadScript('https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js', 'tradingview-ticker-container', {
      "symbols": [
        { "proName": "FX_IDC:USDNGN", "title": "USD/NGN" },
        { "description": "Global Sukuk ETF", "proName": "AMEX:SKUK" },
        { "description": "MTN Nigeria", "proName": "NSE:MTNN" },
        { "description": "Dangote Cement", "proName": "NSE:DANGCEM" },
        { "description": "Gold (Halal)", "proName": "TVC:GOLD" },
        { "description": "Microsoft (Halal)", "proName": "NASDAQ:MSFT" },
        { "description": "Tesla (Halal)", "proName": "NASDAQ:TSLA" }
      ],
      "showSymbolLogo": true,
      "colorTheme": "light",
      "isTransparent": false,
      "displayMode": "adaptive",
      "locale": "en"
    });

    this.loadScript('https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js', 'tradingview-tech-analysis', {
      "interval": "1m",
      "width": "100%",
      "isTransparent": false,
      "height": "100%",
      "symbol": "NASDAQ:MSFT",
      "showIntervalTabs": true,
      "locale": "en",
      "colorTheme": "light"
    });

    this.loadScript('https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js', 'tradingview-market-overview', {
      "colorTheme": "light",
      "dateRange": "12M",
      "showChart": true,
      "locale": "en",
      "width": "100%",
      "height": "100%",
      "largeChartByThreeColumns": true,
      "isTransparent": false,
      "showSymbolLogo": true,
      "showFloatingTooltip": true,
      "tabs": [
        {
          "title": "Global Halal Giants",
          "symbols": [
            { "s": "NASDAQ:AAPL", "d": "Apple Inc." },
            { "s": "NASDAQ:MSFT", "d": "Microsoft" },
            { "s": "NASDAQ:GOOGL", "d": "Alphabet" },
            { "s": "NASDAQ:NVDA", "d": "NVIDIA" },
            { "s": "NASDAQ:TSLA", "d": "Tesla" },
            { "s": "NASDAQ:AMZN", "d": "Amazon" },
            { "s": "NYSE:JNJ", "d": "Johnson & Johnson" },
            { "s": "NYSE:V", "d": "Visa" }
          ],
          "originalTitle": "Global Stocks"
        },
        {
          "title": "Nigerian Halal Sector",
          "symbols": [
            { "s": "NSE:MTNN", "d": "MTN Nigeria" },
            { "s": "NSE:DANGCEM", "d": "Dangote Cement" },
            { "s": "NSE:BUACEMENT", "d": "BUA Cement" },
            { "s": "NSE:AIRTELAFRI", "d": "Airtel Africa" },
            { "s": "NSE:OKOMUOIL", "d": "Okomu Oil" },
            { "s": "NSE:NESTLE", "d": "Nestle Nigeria" },
            { "s": "NSE:PRESCO", "d": "Presco Plc" },
            { "s": "NSE:TOTAL", "d": "TotalEnergies" },
            { "s": "NSE:SEPLAT", "d": "Seplat Energy" }
          ],
          "originalTitle": "Local Stocks"
        },
        {
          "title": "Fixed Income & Sukuk",
          "symbols": [
            { "s": "AMEX:SKUK", "d": "Global Sukuk" },
            { "s": "NASDAQ:HLAL", "d": "Wahed Shariah ETF" },
            { "s": "NASDAQ:SPRE", "d": "Shariah REITs" },
            { "s": "TVC:GOLD", "d": "Spot Gold" },
            { "s": "NASDAQ:SUSA", "d": "iShares Shariah" }
          ],
          "originalTitle": "Fixed Income"
        }
      ]
    });
  }

  private loadScript(src: string, containerId: string, settings: any) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    script.async = true;
    script.innerHTML = JSON.stringify(settings);
    container.appendChild(script);
  }

  viewDetail(portfolio: Product) {
    this.selectedPortfolio.set(portfolio);
    this.showDetailModal.set(true);
  }

  closeModal() {
    this.showDetailModal.set(false);
    this.showInvestModal.set(false);
  }

  openInvestModal() {
    this.showDetailModal.set(false);
    this.showInvestModal.set(true);
  }

  confirmInvestment() {
    if (!this.selectedPortfolio() || this.investAmount() <= 0) return;

    this.isProcessing.set(true);
    this.investmentService.invest(this.selectedPortfolio()!.portfolioId, this.investAmount()).subscribe({
      next: (res) => {
        this.isProcessing.set(false);
        this.closeModal();
        Swal.fire({
          icon: 'success',
          title: 'Investment Successful',
          text: `You have successfully invested ₦${this.investAmount().toLocaleString()} in ${this.selectedPortfolio()!.name}`,
          confirmButtonColor: '#1B4332',
          customClass: { popup: 'rounded-[30px]' }
        });
      },
      error: () => this.isProcessing.set(false)
    });
  }

  getAssetColor(index: number): string {
    const colors = ['bg-[#1B4332]', 'bg-[#C9A84C]', 'bg-[#2D6A4F]', 'bg-[#0d1a0f]', 'bg-[#40916c]'];
    return colors[index % colors.length];
  }

  getAssetTextColor(index: number): string {
    const colors = ['text-[#1B4332]', 'text-[#C9A84C]', 'text-[#2D6A4F]', 'text-[#0d1a0f]', 'text-[#40916c]'];
    return colors[index % colors.length];
  }
}
