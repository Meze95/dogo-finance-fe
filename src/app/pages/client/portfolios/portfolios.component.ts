import { Component, signal, computed, inject, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../shared/services/product.service';
import { InvestmentService } from '../../../shared/services/investment.service';
import { Product, ProductAssetAllocation } from '../../../shared/models/product.model';
import { AuthService } from '../../../shared/services/auth.service';
import { TransactionService } from '../../../shared/services/transaction.service';
import { CustomerService } from '../../../shared/services/customer.service';

import { AlertService } from '../../../shared/services/alert.service';
import { Router } from '@angular/router';

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
  private transactionService = inject(TransactionService);
  private authService = inject(AuthService);
  private customerService = inject(CustomerService);
  private alertService = inject(AlertService);
  private router = inject(Router);

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
  investAmount = signal<string>('100000');
  investStep = signal<'amount' | 'bvn' | 'pin' | 'otp'>('amount');
  investPin = signal<string>('');
  investOtp = signal<string>('');
  isInvesting = signal(false);
  investBvn = signal<string>('');
  otpCountdown = signal(60);
  canResendOtp = signal(false);
  private countdownInterval: any;
  
  user = this.authService.currentUser;
  availableNaira = signal(0);

  ngOnInit() {
    this.productService.getPortfolios();
    this.loadWalletBalance();
  }

  loadWalletBalance() {
    const customerId = this.user()?.CustomerId || this.user()?.customerId;
    if (customerId) {
        this.transactionService.getWallet(customerId).subscribe({
          next: (res: any) => {
            const data = res?.data || res?.Data;
            if (data) this.availableNaira.set(data.balance || data.Balance || 0);
          }
        });
    }
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
    this.investStep.set('amount');
    this.investPin.set('');
    this.investOtp.set('');
    this.investBvn.set('');
    this.showInvestModal.set(true);
  }

  onAmountInput(event: any) {
    const val = event.target.value.replace(/[^0-9]/g, '');
    this.investAmount.set(val);
  }

  formatWithCommas(value: string | number): string {
    if (!value) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  startOtpCountdown() {
    this.otpCountdown.set(60);
    this.canResendOtp.set(false);
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    
    this.countdownInterval = setInterval(() => {
      if (this.otpCountdown() > 0) {
        this.otpCountdown.update(v => v - 1);
      } else {
        this.canResendOtp.set(true);
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  resendInvestOtp() {
    if (!this.canResendOtp()) return;
    
    const amountNum = Number(this.investAmount().replace(/,/g, ''));
    const pId = this.selectedPortfolio()?.portfolioId;
    if (!pId) return;

    this.isInvesting.set(true);
    this.transactionService.tempInvest(pId, amountNum, this.investPin()).subscribe({
        next: (res) => {
            this.isInvesting.set(false);
            this.startOtpCountdown();
            Swal.fire({
                icon: 'success',
                title: 'New OTP Sent',
                text: 'A fresh authorization code has been sent to your email.',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        },
        error: (err) => {
            this.isInvesting.set(false);
            Swal.fire({
                icon: 'error',
                title: 'Failed to resend',
                text: err.error?.message || 'Please try again later.',
                confirmButtonColor: 'var(--dogo-primary)'
            });
        }
    });
  }

  verifyBvnInvestment() {
    const customerId = this.user()?.CustomerId || this.user()?.customerId;
    if (!customerId || !this.investBvn()) return;

    this.isInvesting.set(true);
    this.customerService.verifyBvn(customerId, this.investBvn()).subscribe({
      next: (res) => {
        this.isInvesting.set(false);
        if (res.success || res.boolean) {
          this.investStep.set('pin');
          Swal.fire({
            icon: 'success',
            title: 'BVN Verified',
            text: 'Your BVN has been verified successfully.',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Verification Failed',
            text: res.message || 'We could not verify your BVN.',
            confirmButtonColor: 'var(--dogo-primary)'
          });
        }
      },
      error: (err) => {
        this.isInvesting.set(false);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error?.message || 'Server error during BVN verification.',
          confirmButtonColor: 'var(--dogo-primary)'
        });
      }
    });
  }

  confirmInvestment() {
    const amountNum = Number(this.investAmount().replace(/,/g, ''));
    const pId = this.selectedPortfolio()?.portfolioId;
    if (!pId || amountNum <= 0) return;

    this.isInvesting.set(true);
    this.transactionService.tempInvest(pId, amountNum, this.investPin(), this.investOtp()).subscribe({
      next: (res: any) => {
        this.isInvesting.set(false);
        if (res.success || res.boolean) {
          this.closeModal();
          Swal.fire({
            icon: 'success',
            title: 'Investment Successful',
            text: `You have successfully invested ₦${amountNum.toLocaleString()} in ${this.selectedPortfolio()?.name}`,
            confirmButtonColor: 'var(--dogo-primary)',
            customClass: { popup: 'rounded-[30px]' }
          });
        } else {
          if (res.message === 'PIN_REQUIRED') {
            this.investStep.set('pin');
          } else if (res.message === 'OTP_REQUIRED') {
            this.investStep.set('otp');
            this.startOtpCountdown();
          } else if (res.message?.includes('BVN')) {
            this.investStep.set('bvn');
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Investment Failed',
              text: res.message || 'We could not process your investment.',
              confirmButtonColor: 'var(--dogo-primary)'
            });
          }
        }
      },
      error: (err) => {
        this.isInvesting.set(false);
        const msg = err.error?.message;
        if (msg === 'PIN_REQUIRED') {
          this.investStep.set('pin');
        } else if (msg === 'OTP_REQUIRED') {
          this.investStep.set('otp');
          this.startOtpCountdown();
        } else if (msg?.includes('BVN')) {
          this.investStep.set('bvn');
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: msg || 'An unexpected error occurred.',
            confirmButtonColor: 'var(--dogo-primary)'
          });
        }
      }
    });
  }

  quickFund() {
    const amount = this.investAmount();
    this.showInvestModal.set(false);
    this.router.navigate(['/client/dashboard'], { queryParams: { fundAmount: amount } });
  }

  getAssetColor(index: number): string {
    const colors = ['bg-[var(--dogo-primary)]', 'bg-[var(--dogo-secondary)]', 'bg-[var(--dogo-primary-soft)]', 'bg-[var(--dogo-dark)]', 'bg-[var(--dogo-primary)]'];
    return colors[index % colors.length];
  }

  getAssetTextColor(index: number): string {
    const colors = ['text-[var(--dogo-primary)]', 'text-[var(--dogo-secondary)]', 'text-[var(--dogo-primary-soft)]', 'text-[var(--dogo-dark)]', 'text-[var(--dogo-primary)]'];
    return colors[index % colors.length];
  }
}


