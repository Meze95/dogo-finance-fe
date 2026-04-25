import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvestmentService } from '../../../shared/services/investment.service';
import { Product, UserInvestment, InstrumentHolding } from '../../../shared/models/product.model';
import { AlertService } from '../../../shared/services/alert.service';
import { TransactionService } from '../../../shared/services/transaction.service';
import { AuthService } from '../../../shared/services/auth.service';

declare var Swal: any;

@Component({
  selector: 'app-client-investments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './investments.component.html',
  styleUrl: './investments.component.css'
})
export class ClientInvestmentsComponent implements OnInit {
  private investmentService = inject(InvestmentService);
  private alertService = inject(AlertService);

  userInvestments = this.investmentService.userInvestments;
  
  totalPortfolioValue = signal(0);
  totalProfit = signal(0);
  activePlansCount = computed(() => this.userInvestments().length);
  
  private transactionService = inject(TransactionService);
  private authService = inject(AuthService);

  ngOnInit() {
    this.loadSummary();
  }

  loadSummary() {
    this.transactionService.getPortfolioSummary().subscribe({
        next: (res: any) => {
            const data = res?.data || res?.Data;
            if (data) {
                this.totalPortfolioValue.set(data.currentValue || data.CurrentValue || 0);
                this.totalProfit.set(data.profit || data.Profit || 0);
            }
        }
    });
  }

  selectedInvestment = signal<UserInvestment | null>(null);
  showManageModal = signal(false);
  isProcessing = signal(false);

  // Partial Sell State
  selectedHolding = signal<InstrumentHolding | null>(null);
  sellAmount = signal<number>(0);
  sellStep = signal<'amount' | 'pin' | 'otp'>('amount');
  sellPin = signal<string>('');
  sellOtp = signal<string>('');
  sellError = signal<string | null>(null);

  // Liquidation Calculations
  daysHeld = computed(() => {
    const inv = this.selectedInvestment();
    if (!inv) return 0;
    const start = new Date(inv.investedAt);
    const now = new Date();
    
    // Use UTC for consistent day difference
    const diff = now.getTime() - start.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    return Math.max(0, days);
  });

  isExitFeeApplicable = computed(() => {
    const inv = this.selectedInvestment();
    if (!inv) return false;
    return this.daysHeld() < (inv.minHoldingPeriodDays || 0);
  });

  calculatedExitFee = computed(() => {
    const inv = this.selectedInvestment();
    if (!inv || !this.isExitFeeApplicable()) return 0;
    return this.sellAmount() * ((inv.exitFeePercentage || 0) / 100);
  });

  netPayable = computed(() => {
    return this.sellAmount() - this.calculatedExitFee();
  });

  manageInvestment(invest: UserInvestment) {
    this.selectedInvestment.set(invest);
    this.showManageModal.set(true);
    this.selectedHolding.set(null);
    this.sellAmount.set(0);
    this.sellStep.set('amount');
    this.sellPin.set('');
    this.sellOtp.set('');
    this.sellError.set(null);

    // Fetch real holdings for this portfolio
    this.investmentService.getPortfolioHoldings(invest.portfolioId).subscribe({
        next: (holdings) => {
            if (this.selectedInvestment()?.id === invest.id) {
                this.selectedInvestment.update(prev => prev ? { ...prev, holdings: holdings } : null);
            }
        }
    });
  }

  closeModal() {
    this.showManageModal.set(false);
    this.sellStep.set('amount');
    this.sellError.set(null);
  }


  confirmPortfolioSell() {
    if (!this.selectedInvestment() || this.sellAmount() <= 0) return;
    const inv = this.selectedInvestment()!;
    
    if (this.sellStep() === 'amount' && this.sellAmount() > inv.currentValue) {
        this.alertService.error('Invalid Amount', 'You cannot sell more than the available value.');
        return;
    }

    this.isProcessing.set(true);
    const amountToSell = this.sellAmount();

    this.investmentService.sell(inv.portfolioId, amountToSell, this.sellPin(), this.sellOtp()).subscribe({
        next: (res: any) => {
            this.isProcessing.set(false);
            const msg = (res?.message || res?.Message || '').toString();
            const isSuccess = res?.success || res?.Success || res?.boolean || res?.Boolean || false;

            if (msg.includes('PIN_REQUIRED')) {
                this.sellStep.set('pin');
                this.sellPin.set('');
                this.sellError.set(null);
                return;
            }
            if (msg.includes('OTP_REQUIRED')) {
                this.sellStep.set('otp');
                this.sellError.set(null);
                this.alertService.info('Verification Required', 'A security code has been sent to your email.');
                return;
            }

            // Verify actual success before proceeding to close/toast
            if (!isSuccess) {
                this.sellError.set(msg || 'Transaction could not be completed.');
                return;
            }

            this.sellAmount.set(0);
            this.sellPin.set('');
            this.sellOtp.set('');
            this.sellError.set(null);
            this.sellStep.set('amount');
            this.closeModal();
            this.loadSummary();

            // Show a premium success message that persists
            Swal.fire({
                title: 'Investment Liquidated!',
                text: `Successfully sold ₦${amountToSell.toLocaleString()} from your portfolio. The funds have been added to your wallet.`,
                icon: 'success',
                confirmButtonText: 'Great!',
                confirmButtonColor: '#1B4332',
                customClass: {
                    popup: 'rounded-[2.5rem]',
                    confirmButton: 'rounded-2xl px-10 py-4 font-black uppercase tracking-widest text-[10px]'
                }
            });
        },
        error: (err) => {
            this.isProcessing.set(false);
            const errorBody = err.error;
            const msg = (errorBody?.message || errorBody?.Message || errorBody || '').toString();
            
            if (msg.includes('PIN_REQUIRED')) {
                this.sellStep.set('pin');
                this.sellPin.set('');
                this.sellError.set(null);
                return;
            }
            if (msg.includes('OTP_REQUIRED')) {
                this.sellStep.set('otp');
                this.sellError.set(null);
                this.alertService.info('Verification Required', 'A security code has been sent to your email.');
                return;
            }

            this.sellError.set(msg || 'Failed to process divestment.');
        }
    });
  }

  formatWithCommas(value: any): string {
    if (value === null || value === undefined || value === '') return '';
    const num = value.toString().replace(/[^0-9.]/g, '');
    if (!num) return '';
    const parts = num.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  onAmountInput(event: any) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }

    const numValue = parseFloat(value);
    this.sellAmount.set(isNaN(numValue) ? 0 : numValue);
    
    // Update input display with commas
    input.value = this.formatWithCommas(value);
  }

  handleLiquidateAll() {
    if (this.userInvestments().length === 0) return;

    Swal.fire({
      title: 'Liquidate All?',
      text: 'This will sell all instruments in all active portfolios. This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#1B4332',
      confirmButtonText: 'Yes, Sell Everything',
      background: '#f8f7f2',
      customClass: { popup: 'rounded-[30px]' }
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.isProcessing.set(true);
        this.investmentService.liquidateEverything().subscribe({
          next: () => {
            this.isProcessing.set(false);
            this.alertService.success('Liquidated!', 'All your investments have been converted to cash.');
          },
          error: () => {
            this.isProcessing.set(false);
            this.alertService.error('Action Failed', 'Failed to liquidate investments.');
          }
        });
      }
    });
  }

  selectHoldingForSell(holding: InstrumentHolding) {
    this.selectedHolding.set(holding);
    this.sellAmount.set(0);
  }

  confirmPartialSell() {
    if (!this.selectedInvestment() || !this.selectedHolding() || this.sellAmount() <= 0) return;
    if (this.sellAmount() > this.selectedHolding()!.units) return;

    this.isProcessing.set(true);
    this.investmentService.sellInstrumentUnits(
        this.selectedInvestment()!.id, 
        this.selectedHolding()!.id, 
        this.sellAmount()
    ).subscribe({
      next: () => {
        this.isProcessing.set(false);
        this.selectedHolding.set(null);
        this.alertService.success('Sold!', 'Instrument units sold successfully.');
      },
      error: () => {
        this.isProcessing.set(false);
        this.alertService.error('Action Failed', 'Failed to sell instrument units.');
      }
    });
  }
}
