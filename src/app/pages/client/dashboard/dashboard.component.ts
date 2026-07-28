import { Component, signal, computed, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../shared/services/auth.service';
import { CustomerService } from '../../../shared/services/customer.service';
import { ProductService } from '../../../shared/services/product.service';
import { InvestmentService } from '../../../shared/services/investment.service';
import { InvestmentStub, Product } from '../../../shared/models/product.model';
import { TransactionService } from '../../../shared/services/transaction.service';
import { timeout, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

declare var Swal: any;
import { DropdownComponent } from '../../../shared/components/ui/dropdown.component';
import { SettingsService, BankAccount } from '../settings/settings.service';

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'profit' | 'investment';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  description: string;
}

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DropdownComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class ClientDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private customerService = inject(CustomerService);
  private productService = inject(ProductService);
  private investmentService = inject(InvestmentService);
  private transactionService = inject(TransactionService);
  private settingsService = inject(SettingsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  constructor() {
    // Reactively load data when user is available
    effect(() => {
      if (this.user()) {
        this.loadTodoList();
        this.loadDashboardData();
        this.loadBanks();
      }
    });
  }

  // Signals for state management
  user = this.authService.currentUser;
  portfolios = this.productService.portfolios;
  suggestedPortfolios = computed(() => this.portfolios().filter(p => p.isActive).slice(0, 3));

  showInvestModal = signal(false);
  showDetailModal = signal(false);
  selectedPortfolio = signal<Product | null>(null);
  investAmount = signal<string>('');
  investStep = signal<'amount' | 'bvn' | 'pin' | 'otp'>('amount');
  investPin = signal<string>('');
  investOtp = signal<string>('');
  isInvesting = signal(false);
  showDollarComingSoonModal = signal(false);
  investBvn = signal<string>('');
  otpCountdown = signal(60);
  canResendOtp = signal(false);

  // USD Funding Signals
  showDollarFundModal = signal(false);
  dollarFundStep = signal<'source' | 'naira-amount' | 'wire-details' | 'upload-receipt' | 'success'>('source');
  dollarAmountInput = signal<string>('');
  dollarExchangeRate = 1453;
  
  dollarReceiptFile = signal<File | null>(null);
  dollarReceiptFileName = signal<string>('');
  dollarReceiptFilePreview = signal<string | null>(null);
  dollarSelectedFundingType = signal<'naira' | 'wire' | null>(null);
  dollarFundSuccessMsg = signal<string>('');

  convertedNairaCost = computed(() => {
    const usd = parseFloat(this.dollarAmountInput().replace(/,/g, '')) || 0;
    return usd * this.dollarExchangeRate;
  });

  hasSufficientNairaForUsd = computed(() => {
    return this.availableNaira() >= this.convertedNairaCost();
  });
  private countdownInterval: any;

  userName = computed(() => {
    const u = this.user();
    return u?.firstName ? `${u.firstName} ${u.lastName}` : 'Dogo User';
  });

  availableNaira = signal(0);
  availableDollar = signal(0);
  actualInvestedValue = signal(0);
  portfolioGrowth = signal(0);
  totalProfit = signal(0);
  hideBalances = signal(false); // New Privacy Signal
  activeWalletIndex = signal(0);

  onWalletScroll(event: Event) {
    const target = event.target as HTMLElement;
    this.activeWalletIndex.set(target.scrollLeft > 50 ? 1 : 0);
  }

  totalActiveInvestment = computed(() => {
    return this.actualInvestedValue();
  });

  totalPortfolioValue = computed(() => {
    return this.actualInvestedValue() + this.availableNaira();
  });

  activeInvestments = signal<InvestmentStub[]>([]);

  nextSteps = signal<any[]>([]);

  ngOnInit() {
    this.productService.getPortfolios();
    this.loadRelationshipTypes();
    this.loadAddressDocTypes();

    this.route.queryParams.subscribe(params => {
      const fundAmount = params['fundAmount'];
      if (fundAmount) {
        this.transactionAmount.set(fundAmount);
        this.openTransactionModal('fund');

        // Clean URL parameters
        this.router.navigate([], {
          queryParams: { fundAmount: null },
          queryParamsHandling: 'merge'
        });
      }
    });

    // Auto-refresh balance every 5 minutes for performance optimization
    const intervalId = setInterval(() => {
      this.loadDashboardData();
    }, 300000);
  }

  loadDashboardData() {
    const userId = this.user()?.UserId || this.user()?.userId;
    const customerId = this.user()?.CustomerId || this.user()?.customerId;

    // These endpoints rely on the Auth Token (User Identity)
    this.transactionService.getHistory().subscribe({
      next: (res: any) => {
        console.log('RAW TRANSACTION HISTORY:', res); // Debug: Check the exact payload
        let data = res?.data || res?.Data || res;

        // If data is an object, try to find an array inside it (fallback for different API structures)
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          const arrayProp = Object.values(data).find(v => Array.isArray(v));
          if (arrayProp) data = arrayProp;
        }

        const isArray = Array.isArray(data);
        if (isArray) {
          const mapped = data.map((tx: any) => {
            const rawType = tx.type || tx.Type || tx.transactionType || tx.TransactionType;
            const rawStatus = tx.status || tx.Status;

            let mappedType: 'deposit' | 'withdrawal' | 'profit' | 'investment' = 'deposit';
            if (rawType === 'withdrawal' || rawType === 2) mappedType = 'withdrawal';
            else if (rawType === 'investment' || rawType === 4 || rawType === 'BUY') mappedType = 'investment';
            else if (rawType === 'profit' || rawType === 3) mappedType = 'profit';

            let mappedStatus: 'completed' | 'pending' | 'failed' = 'pending';
            const statusStr = String(rawStatus || '').toLowerCase();
            if (rawStatus === 1 || statusStr === 'success' || statusStr === 'completed') mappedStatus = 'completed';
            else if (statusStr === 'failed' || statusStr === 'rejected' || rawStatus === 2) mappedStatus = 'failed';

            return {
              id: (tx.transactionId || tx.TransactionId || tx.id || tx.Id || Math.random())?.toString(),
              type: mappedType,
              amount: tx.amount || tx.Amount || tx.value || tx.Value || 0,
              status: mappedStatus,
              date: this.formatDate(tx.createdAt || tx.CreatedAt || tx.date || tx.Date || tx.transactionDate || tx.TransactionDate),
              description: tx.narration || tx.Narration || tx.description || tx.Description || (mappedType === 'deposit' ? 'Deposit' : 'Withdrawal')
            };
          });
          this.recentTransactions.set(mapped);
        }
      },
      error: (err) => console.error('Dashboard Activity Error:', err)
    });

    this.transactionService.getPortfolioSummary().subscribe({
      next: (res: any) => {
        const isSuccess = res?.success === true || res?.Success === true || res?.status === 200;
        const data = res?.data || res?.Data;

        if (isSuccess && data) {
          this.actualInvestedValue.set(data.currentValue || data.CurrentValue || 0);
          this.portfolioGrowth.set(data.returnPercentage || data.ReturnPercentage || 0);
          this.totalProfit.set(data.profit || data.Profit || 0);
        }
      }
    });

    // This endpoint specifically needs the CustomerId
    if (customerId) {
      this.transactionService.getWallet(customerId).subscribe({
        next: (res: any) => {
          const isSuccess = res?.success === true || res?.Success === true || res?.boolean === true;
          const data = res?.data || res?.Data;

          if (isSuccess && data) {
            this.availableNaira.set(data.balance || data.Balance || 0);
            this.availableDollar.set(data.usdBalance || data.UsdBalance || data.dollarBalance || data.DollarBalance || 0);
          }
        }
      });

      this.transactionService.getActiveInvestments(customerId).subscribe({
        next: (res: any) => {
          const data = res?.data || res?.Data || [];
          if (Array.isArray(data)) {
            const mapped = data.map((inv: any) => ({
              label: inv.portfolioName || 'Investment',
              value: inv.currentValue || 0,
              growth: inv.growth || 0,
              icon: 'ri-pie-chart-2-fill',
              color: inv.riskLevel === 'High' ? 'bg-red-600' : inv.riskLevel === 'Medium' ? 'bg-orange-500' : 'bg-[var(--dogo-primary)]'
            }));
            this.activeInvestments.set(mapped);
          }
        }
      });

      this.customerService.getCompanyBankDetails().subscribe({
        next: (res: any) => {
          const data = res?.data || res?.Data;
          if (data) {
            this.companyBankDetails.set({
              bankName: data.bankName || data.BankName || data.BankId?.toString() || 'Company Bank',
              accountName: data.companyName || data.CompanyName || 'Dogo',
              accountNumber: data.accountNumber || data.AccountNumber || '0000000000'
            });
          }
        }
      });
    }
  }

  loadBanks() {
    this.settingsService.getMyBanks().subscribe({
      next: (res) => {
        if (res.data) this.registeredBanks.set(res.data);
      }
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'Recent';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
  }

  viewDetail(portfolio: Product) {
    this.selectedPortfolio.set(portfolio);
    this.showDetailModal.set(true);
  }

  getAssetColor(index: number): string {
    const colors = ['bg-[var(--dogo-primary)]', 'bg-[var(--dogo-secondary)]', 'bg-[var(--dogo-primary-soft)]', 'bg-[var(--dogo-dark)]', 'bg-[var(--dogo-primary)]'];
    return colors[index % colors.length];
  }

  openInvest(portfolio: Product) {
    this.showDetailModal.set(false);
    this.selectedPortfolio.set(portfolio);
    this.investAmount.set('');
    this.investStep.set('amount');
    this.investPin.set('');
    this.investOtp.set('');
    this.investBvn.set('');
    this.showInvestModal.set(true);
  }

  verifyBvnInvestment() {
    const customerId = this.user()?.CustomerId || this.user()?.customerId;
    if (!customerId || !this.investBvn()) return;

    this.isInvesting.set(true);
    this.customerService.verifyBvn(customerId, this.investBvn()).subscribe({
      next: (res) => {
        this.isInvesting.set(false);
        if (res.success || res.boolean) {
          // Success! Now move to PIN step
          this.investStep.set('pin');
          Swal.fire({
            icon: 'success',
            title: 'BVN Verified',
            text: 'Your BVN has been verified successfully. Please continue with your investment.',
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

    const pId = this.selectedPortfolio()?.portfolioId;
    if (!pId) return;

    const amountNum = Number(this.investAmount().replace(/,/g, ''));
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

  resendWithdrawalOtp() {
    if (!this.canResendOtp()) return;

    const currentUser = this.user();
    const customerId = currentUser?.CustomerId || currentUser?.customerId || currentUser?.id || currentUser?.Id;
    const amount = Number(this.transactionAmount().replace(/,/g, ''));
    const pin = this.withdrawPin();

    if (!customerId || !amount) return;

    this.isProcessing.set(true);
    this.transactionService.sendWithdrawalOtp(Number(customerId), amount).subscribe({
      next: (res) => {
        this.isProcessing.set(false);
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
        this.isProcessing.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to resend OTP');
        Swal.fire({
          icon: 'error',
          title: 'Failed to resend',
          text: err.error?.message || 'Please try again later.',
          confirmButtonColor: 'var(--dogo-primary)'
        });
      }
    });
  }

  confirmInvestment() {
    if (!this.selectedPortfolio() || !this.investAmount()) return;

    // Check BVN verification status first
    const u = this.user();
    // Assuming backend returns Bvnverified or similar in user profile or we can check via AuthService
    // For this context, we'll assume the backend will return 403 if not verified

    this.isInvesting.set(true);
    const amount = Number(this.investAmount().replace(/,/g, ''));

    this.transactionService.tempInvest(this.selectedPortfolio()!.portfolioId, amount, this.investPin(), this.investOtp()).subscribe({
      next: (res: any) => {
        this.isInvesting.set(false);
        if (res.success || res.boolean) {
          this.showInvestModal.set(false);
          this.showDetailModal.set(false);

          Swal.fire({
            icon: 'success',
            title: 'Investment Successful',
            text: `You have successfully invested ₦${amount.toLocaleString()} in ${this.selectedPortfolio()?.name}`,
            confirmButtonColor: 'var(--dogo-primary)',
            background: 'var(--dogo-cream)',
            customClass: { popup: 'rounded-[30px]' }
          });

          // Refresh data
          this.loadDashboardData();
        } else {
          // Check for security requirements
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
              confirmButtonColor: 'var(--dogo-primary)',
              background: 'var(--dogo-cream)'
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
            title: 'Investment Error',
            text: msg || 'An error occurred during investment.',
            confirmButtonColor: 'var(--dogo-primary)',
            background: 'var(--dogo-cream)',
            customClass: { popup: 'rounded-[30px]' }
          });
        }
      }
    });
  }

  quickFund() {
    const investAmt = Number(this.investAmount().replace(/,/g, ''));
    const available = this.availableNaira();
    const shortfall = Math.max(investAmt - available, 0);
    this.showInvestModal.set(false);
    this.transactionAmount.set(shortfall.toString());
    this.openTransactionModal('fund');
  }

  loadRelationshipTypes() {
    this.customerService.getRelationshipTypes().subscribe({
      next: (res) => {
        if (res.data) this.relationshipTypes.set(res.data);
      }
    });
  }

  loadAddressDocTypes() {
    this.settingsService.getAddressDocTypes().subscribe({
      next: (res) => {
        if (res.data) {
          const options = res.data.map((type: any) => ({
            value: type.id.toString(),
            label: type.name
          }));
          this.addressDocOptions.set(options);
        }
      }
    });
  }

  loadTodoList() {
    const customerId = this.user()?.CustomerId || this.user()?.customerId;
    if (customerId) {
      this.customerService.getTodoList(customerId).subscribe({
        next: (res) => {
          if (res.data) {
            const mapped = res.data.map((item: any) => ({
              title: item.title || item.Title,
              desc: item.subtitle || item.Subtitle,
              icon: this.mapTodoIcon(item.icon || item.Icon),
              action: item.actionText || item.ActionText
            }));

            this.nextSteps.set(mapped);
          }
        }
      });
    }
  }

  mapTodoIcon(icon: string) {
    switch (icon?.toLowerCase()) {
      case 'fingerprint': return 'ri-fingerprint-line';
      case 'security': return 'ri-shield-user-line';
      case 'lock': return 'ri-lock-password-line';
      case 'people': return 'ri-parent-line';
      case 'address': return 'ri-map-pin-user-line';
      case 'location': return 'ri-map-pin-user-line';
      default: return 'ri-checkbox-circle-line';
    }
  }

  recentTransactions = signal<Transaction[]>([]);

  // Modal & Verification State
  showVerificationModal = signal(false);
  activeVerification = signal<any>(null);
  verificationInput = signal('');
  pinInput = signal('');
  confirmPinInput = signal('');
  nokName = signal('');
  nokRelationshipId = signal<number | string>('');
  nokEmail = signal('');
  nokPhone = signal('');
  relationshipTypes = signal<any[]>([]);
  isProcessing = signal(false);
  isSuccess = signal(false);

  // Address Verification State
  addressDocType = signal('');
  addressFile = signal<File | null>(null);
  addressFilePreview = signal<string | null>(null);
  addressDocOptions = signal<any[]>([]);

  // Transaction Modal State
  showTransactionModal = signal(false);
  transactionType = signal<'fund' | 'withdraw'>('fund');
  transactionAmount = signal<string>('');
  withdrawAccountId = signal<string>('');
  withdrawPin = signal<string>('');

  registeredBanks = signal<BankAccount[]>([]);

  // Funding specific states
  fundingStep = signal<'amount' | 'source' | 'card' | 'otp' | 'pin' | 'virtual' | 'manual' | 'bvn' | 'success'>('amount');
  otpMessage = signal('');
  selectedSource = signal<'card' | 'virtual' | 'manual' | null>(null);
  cardNumber = signal('');
  expiryDate = signal('');
  cvv = signal('');
  cardPin = signal('');
  otpInput = signal('');
  currentReference = signal('');
  currentChargeId = signal('');
  errorMessage = signal('');

  companyBankDetails = signal<{ bankName: string, accountName: string, accountNumber: string } | null>(null);
  manualReference = signal('');
  manualReceiptPath = signal('');
  manualReceiptFile = signal<File | null>(null);
  manualReceiptFilePreview = signal<string | null>(null);

  virtualAccounts = signal<{ bankName: string, accountName: string, accountNumber: string }[]>([]);

  cardType = signal<string>('');

  cardTypeIcon = computed(() => {
    switch (this.cardType()) {
      case 'visa': return 'ri-visa-fill text-blue-600';
      case 'mastercard': return 'fa-brands fa-cc-mastercard text-orange-500';
      case 'verve': return 'ri-bank-card-fill text-green-600';
      case 'amex': return 'fa-brands fa-cc-amex text-blue-400';
      default: return 'ri-bank-card-line text-[var(--dogo-primary)]/20';
    }
  });

  detectCardType(number: string): string {
    const cleanNumber = number.replace(/\D/g, '');
    if (/^4/.test(cleanNumber)) return 'visa';
    if (/^5[1-5]/.test(cleanNumber) || /^(222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/.test(cleanNumber)) return 'mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'amex';
    if (/^(5060|5061|5078|5079|6500|6504|6509|6511)/.test(cleanNumber)) return 'verve';
    return '';
  }

  luhnCheck(cardNumber: string): boolean {
    let sum = 0;
    let shouldDouble = false;
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber.charAt(i), 10);
      if (shouldDouble) {
        if ((digit *= 2) > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  }

  totalGrowth = computed(() => {
    const assets = this.activeInvestments();
    return assets.reduce((acc, curr) => acc + (curr.value * (curr.growth / 100)), 0);
  });

  isCardValid = computed(() => {
    const card = this.cardNumber().replace(/\s/g, '');
    const expiry = this.expiryDate();
    const cvv = this.cvv();
    const pin = this.cardPin();

    const type = this.cardType();
    let minLen = 16;
    if (type === 'amex') minLen = 15;

    if (card.length < minLen || !this.luhnCheck(card)) return false;

    // Expiry validation
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
    const [m, y] = expiry.split('/').map(Number);
    if (m < 1 || m > 12) return false;

    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;

    // Check expiration: current year > expiry year OR (same year AND current month > expiry month)
    if (y < currentYear || (y === currentYear && m < currentMonth)) return false;

    if (cvv.length !== 3) return false;

    // Relaxed PIN check: Valid if empty (optional) OR exactly 4 digits
    if (pin.length > 0 && pin.length !== 4) return false;

    return true;
  });

  validationError = computed(() => {
    if (this.fundingStep() !== 'card') return '';

    const card = this.cardNumber().replace(/\s/g, '');
    const expiry = this.expiryDate();
    const cvv = this.cvv();
    const pin = this.cardPin();

    const type = this.cardType();
    let minLen = 16;
    if (type === 'amex') minLen = 15;

    if (card && card.length < minLen) return 'Enter a valid card number';
    if (card && card.length >= minLen && !this.luhnCheck(card)) return 'Invalid card number (fails check)';

    if (expiry.length === 5) {
      const [m, y] = expiry.split('/').map(Number);
      const now = new Date();
      const currentYear = now.getFullYear() % 100;
      const currentMonth = now.getMonth() + 1;
      if (m < 1 || m > 12) return 'Invalid expiry month';
      if (y < currentYear || (y === currentYear && m < currentMonth)) return 'This card has expired';
    }

    if (cvv && cvv.length !== 3) return 'CVV must be 3 digits';
    if (pin && pin.length !== 4) return 'PIN must be 4 digits';

    return '';
  });

  registeredBankOptions = computed(() => {
    return this.registeredBanks().map(bank => ({
      value: (bank.customerBankId || bank.bankId || 0).toString(),
      label: `${bank.bankName} (${bank.accountNumber})`
    }));
  });

  relationshipTypeOptions = computed(() =>
    this.relationshipTypes().map(type => ({
      value: type.id || type.Id,
      label: type.name || type.Name
    }))
  );

  openModal(step: any) {
    this.activeVerification.set(step);
    this.showVerificationModal.set(true);
    this.verificationInput.set('');
    this.pinInput.set('');
    this.confirmPinInput.set('');
    this.nokName.set('');
    this.nokRelationshipId.set('');
    this.nokEmail.set('');
    this.nokPhone.set('');
    this.isProcessing.set(false);
    this.isSuccess.set(false);
    this.errorMessage.set('');
  }

  closeModal() {
    this.showVerificationModal.set(false);
    this.activeVerification.set(null);
    this.addressFile.set(null);
    this.addressFilePreview.set(null);
    this.addressDocType.set('');
  }

  onAddressFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.addressFile.set(file);
      const reader = new FileReader();
      reader.onload = () => this.addressFilePreview.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  onManualReceiptFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.manualReceiptFile.set(file);
      const reader = new FileReader();
      reader.onload = () => this.manualReceiptFilePreview.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  verifyAction() {
    const isPinFlow = this.activeVerification()?.title === 'Create Transaction PIN';
    const isNokFlow = this.activeVerification()?.title === 'Add Next of Kin';
    const isAddressFlow = this.activeVerification()?.title === 'Address Verification';

    if (isPinFlow) {
      if (this.pinInput().length !== 6 || this.pinInput() !== this.confirmPinInput()) return;
    } else if (isNokFlow) {
      if (!this.nokName() || !this.nokEmail() || !this.nokPhone()) return;
    } else if (isAddressFlow) {
      if (!this.addressDocType() || !this.addressFile()) return;
    } else {
      if (this.verificationInput().length !== 11) return;
    }


    this.isProcessing.set(true);

    if (isAddressFlow) {
      if (!this.addressDocType() || !this.addressFile()) return;

      const formData = new FormData();
      formData.append('DocTypeId', this.addressDocType());
      formData.append('File', this.addressFile()!);

      this.settingsService.verifyAddress(formData).subscribe({
        next: (res) => {
          this.handleSuccessAction();
        },
        error: (err) => {
          this.isProcessing.set(false);
          this.errorMessage.set(err.error?.message || 'Failed to upload document');
          Swal.fire({
            icon: 'error',
            title: 'Upload Failed',
            text: err.error?.message || 'We could not process your document.',
            confirmButtonColor: 'var(--dogo-primary)'
          });
        }
      });
      return;
    }

    if (isNokFlow) {
      const customerId = this.user()?.CustomerId || this.user()?.customerId;
      const nokData = {
        fullName: this.nokName(),
        relationshipTypeId: Number(this.nokRelationshipId()),
        email: this.nokEmail(),
        phoneNumber: this.nokPhone(),
        address: 'N/A' // Added default for API
      };

      this.customerService.addNextOfKin(customerId, nokData).subscribe({
        next: (res) => {
          this.handleSuccessAction();
        },
        error: (err) => {
          this.isProcessing.set(false);
          this.errorMessage.set(err.error?.message || 'Failed to update Next of Kin');
        }
      });
    } else if (isPinFlow) {
      this.authService.setupPin({
        pin: this.pinInput(),
        confirmPin: this.confirmPinInput()
      }).subscribe({
        next: (res) => {
          if (res.boolean || res.success) {
            this.handleSuccessAction();
          } else {
            this.isProcessing.set(false);
            this.errorMessage.set(res.message || 'PIN setup failed');
          }
        },
        error: (err) => {
          console.error('PIN Setup Error:', err);
          this.isProcessing.set(false);
          this.errorMessage.set(err.error?.message || 'Error setting up PIN');
        }
      });
    } else {
      const customerId = this.user()?.CustomerId || this.user()?.customerId;
      const idNumber = this.verificationInput();
      const isBvnFlow = this.activeVerification()?.actionType === 'BVN_VERIFY' || this.activeVerification()?.title === 'Verify BVN';

      const verification$ = isBvnFlow
        ? this.customerService.verifyBvn(customerId, idNumber)
        : this.customerService.verifyNin(customerId, idNumber);

      verification$.subscribe({
        next: (res) => {
          if (res.success || res.boolean) {
            this.handleSuccessAction();
          } else {
            this.isProcessing.set(false);
            this.errorMessage.set(res.message || 'Verification failed');
          }
        },
        error: (err) => {
          console.error('Verification Error:', err);
          this.isProcessing.set(false);
          this.errorMessage.set(err.error?.message || 'Server connection error');
        }
      });
    }
  }

  private handleSuccessAction() {
    this.isProcessing.set(false);
    this.isSuccess.set(true);

    // Remove from list after success
    setTimeout(() => {
      const verifiedTitle = this.activeVerification()?.title;
      this.nextSteps.set(this.nextSteps().filter(s => s.title !== verifiedTitle));
      this.closeModal();
    }, 2000);
  }

  openTransactionModal(type: 'fund' | 'withdraw') {
    this.transactionType.set(type);
    this.transactionAmount.set('');

    // Pre-select Primary Account for Withdrawals
    if (type === 'withdraw') {
      const primary = this.registeredBanks().find(b => b.isDefault);
      const first = this.registeredBanks()[0];
      const selectedId = (primary?.customerBankId || primary?.bankId || first?.customerBankId || first?.bankId || '')?.toString();
      this.withdrawAccountId.set(selectedId);
    } else {
      this.withdrawAccountId.set('');
    }

    this.withdrawPin.set('');
    this.fundingStep.set('amount');
    this.selectedSource.set(null);
    this.cardNumber.set('');
    this.expiryDate.set('');
    this.cvv.set('');
    this.cardType.set('');
    this.cardPin.set('');
    this.otpInput.set('');
    this.manualReference.set('');
    this.manualReceiptPath.set('');
    this.manualReceiptFile.set(null);
    this.manualReceiptFilePreview.set(null);
    this.errorMessage.set('');
    this.showTransactionModal.set(true);
    this.isProcessing.set(false);
  }

  closeTransactionModal() {
    this.showTransactionModal.set(false);
  }

  showDollarComingSoon() {
    this.showDollarComingSoonModal.set(true);
  }

  dollarPin = signal<string>('');
  wireBankRef = signal<string>('');
  wireRemarks = signal<string>('');

  openDollarFunding() {
    this.dollarAmountInput.set('');
    this.dollarFundStep.set('source');
    this.dollarReceiptFile.set(null);
    this.dollarReceiptFileName.set('');
    this.dollarReceiptFilePreview.set(null);
    this.dollarSelectedFundingType.set(null);
    this.dollarFundSuccessMsg.set('');
    this.dollarPin.set('');
    this.wireBankRef.set('');
    this.wireRemarks.set('');
    this.showDollarFundModal.set(true);
    this.fetchFxRateQuote();
  }

  fetchFxRateQuote() {
    // Fetch live rate quote from API (defaults to 1000 NGN query just to get current effective rate)
    this.transactionService.getFxRateQuote(1000).subscribe({
      next: (res) => {
        if (res?.success && res?.data?.effectiveRateWithMargin) {
          this.dollarExchangeRate = res.data.effectiveRateWithMargin;
        }
      },
      error: (err) => console.error('Failed to fetch live FX rate:', err)
    });
  }

  closeDollarFundModal() {
    this.showDollarFundModal.set(false);
  }

  selectDollarFundingSource(type: 'naira' | 'wire') {
    this.dollarSelectedFundingType.set(type);
    if (type === 'naira') {
      this.dollarFundStep.set('naira-amount');
    } else {
      this.dollarFundStep.set('wire-details');
    }
  }

  setQuickDollarAmount(amount: number) {
    this.dollarAmountInput.set(amount.toString());
  }

  handleDollarReceiptUpload(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.dollarReceiptFile.set(file);
      this.dollarReceiptFileName.set(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        this.dollarReceiptFilePreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  submitNairaToDollarConversion() {
    if (!this.hasSufficientNairaForUsd()) {
      return;
    }
    const nairaAmount = this.convertedNairaCost();

    this.isProcessing.set(true);
    this.transactionService.fundDollarWalletFromNaira(nairaAmount).subscribe({
      next: (res) => {
        this.isProcessing.set(false);
        if (res?.success) {
          const usdVal = res.data?.usdCredited || (parseFloat(this.dollarAmountInput().replace(/,/g, '')) || 0);
          this.loadDashboardData(); // Refresh wallets & history
          this.dollarFundSuccessMsg.set(res.message || `Successfully funded your USD wallet with $${usdVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`);
          this.dollarFundStep.set('success');
        } else {
          if (typeof Swal !== 'undefined') {
            Swal.fire('Transaction Failed', res?.message || 'Failed to convert NGN to USD', 'error');
          }
        }
      },
      error: (err) => {
        this.isProcessing.set(false);
        if (typeof Swal !== 'undefined') {
          Swal.fire('Error', err?.error?.message || 'An error occurred during dollar wallet funding.', 'error');
        }
      }
    });
  }

  submitWireReceipt() {
    const usdVal = parseFloat(this.dollarAmountInput().replace(/,/g, '')) || 0;
    if (!this.dollarReceiptFile() || usdVal <= 0) {
      return;
    }

    this.isProcessing.set(true);
    const proofUrl = this.dollarReceiptFilePreview() || this.dollarReceiptFileName();
    const bankRef = this.wireBankRef() || `WIRE_${Date.now()}`;
    const remarks = this.wireRemarks() || 'USD Wire Funding Request';

    this.transactionService.initiateDollarWireFunding({
      usdAmount: usdVal,
      proofDocumentUrl: proofUrl,
      bankReference: bankRef,
      remarks: remarks
    }).subscribe({
      next: (res) => {
        this.isProcessing.set(false);
        if (res?.success) {
          this.dollarFundSuccessMsg.set(res.message || `Your wire transfer deposit request of $${usdVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} has been submitted.`);
          this.dollarFundStep.set('success');
        } else {
          if (typeof Swal !== 'undefined') {
            Swal.fire('Submission Failed', res?.message || 'Failed to submit wire transfer request', 'error');
          }
        }
      },
      error: (err) => {
        this.isProcessing.set(false);
        if (typeof Swal !== 'undefined') {
          Swal.fire('Error', err?.error?.message || 'An error occurred submitting wire receipt.', 'error');
        }
      }
    });
  }

  fetchVirtualAccount() {
    this.isProcessing.set(true);
    this.errorMessage.set('');

    console.log('--- fetchVirtualAccount called ---');
    this.transactionService.getVirtualAccount().subscribe({
      next: (res: any) => {
        try {
          console.log('Virtual Account Response Received:', res);

          // More robust success check
          const isSuccess = res?.success === true || res?.Success === true || res?.status === 200 || res?.Status === 200 || res?.boolean === true;
          const dataPayload = res?.data || res?.Data;
          const message = res?.message || res?.Message || '';

          if (isSuccess && dataPayload) {
            const accountsData = Array.isArray(dataPayload) ? dataPayload : [dataPayload];

            if (accountsData.length === 0) {
              this.errorMessage.set('No virtual accounts found for your profile.');
              this.isProcessing.set(false);
              return;
            }

            const currentUser = this.user();
            const displayName = currentUser ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() : 'Dogo Customer';

            const formattedAccounts = accountsData.map((acc: any) => ({
              bankName: acc.bankName || acc.BankName || acc.bank_name || 'Bank',
              accountName: acc.accountName || acc.AccountName || acc.account_name || displayName,
              accountNumber: acc.accountNumber || acc.AccountNumber || acc.account_number || '0000000000'
            }));

            console.log('Processed virtual accounts:', formattedAccounts);
            this.virtualAccounts.set(formattedAccounts);

            // Transition to virtual account view
            this.fundingStep.set('virtual');
          } else {
            console.warn('Virtual account fetch failed validation:', res);
            if (message && message.toLowerCase().includes('bvn')) {
              this.fundingStep.set('bvn');
            } else {
              this.errorMessage.set(message || 'Payment provider could not provide account details.');
            }
          }
        } catch (e) {
          console.error('Fatal error parsing virtual account data:', e);
          this.errorMessage.set('An interface error occurred. Please try again later.');
        } finally {
          this.isProcessing.set(false);
        }
      },
      error: (err) => {
        console.error('Network error fetching virtual account:', err);
        const errorMsg = err.error?.message || err.error?.Message || 'Connection to banking provider failed.';
        this.errorMessage.set(errorMsg);
        this.isProcessing.set(false);
      }
    });
  }

  verifyBvnInFlow() {
    if (this.verificationInput().length !== 11) return;
    this.isProcessing.set(true);
    const customerId = this.user()?.CustomerId || this.user()?.customerId;

    this.customerService.verifyBvn(customerId, this.verificationInput()).subscribe({
      next: (res) => {
        if (res.success || res.boolean) {
          // Update todo list to remove BVN task
          this.nextSteps.set(this.nextSteps().filter(s => !s.title.includes('BVN')));
          // Now fetch the account
          this.fetchVirtualAccount();
        } else {
          this.isProcessing.set(false);
          this.errorMessage.set(res.message || 'BVN Verification failed');
        }
      },
      error: (err) => {
        this.isProcessing.set(false);
        this.errorMessage.set(err.error?.message || 'Verification error');
      }
    });
  }

  processTransaction() {
    if (!this.transactionAmount()) {
      this.errorMessage.set('Please enter an amount to proceed');
      return;
    }

    // Reset error state
    this.errorMessage.set('');

    const amount = Number(this.transactionAmount().toString().replace(/[^0-9]/g, ''));
    const customerId = this.user()?.CustomerId || this.user()?.customerId || this.user()?.id || this.user()?.Id || this.user()?.userId || this.user()?.UserId;


    if (this.transactionType() === 'fund') {
      if (this.fundingStep() === 'amount') {
        this.fundingStep.set('source');
        this.isProcessing.set(false);
        return;
      }

      if (this.fundingStep() === 'source') {
        if (this.selectedSource() === 'card') {
          this.fundingStep.set('card');
          this.isProcessing.set(false);
        } else if (this.selectedSource() === 'virtual') {
          // Check for BVN verification from todo list
          const needsBvn = this.nextSteps().some(s => s.action === 'VERIFY NOW' && s.title.includes('BVN'));

          if (needsBvn) {
            this.fundingStep.set('bvn');
            this.isProcessing.set(false);
          } else {
            this.fetchVirtualAccount();
          }
        } else if (this.selectedSource() === 'manual') {
          this.fundingStep.set('manual');
          this.isProcessing.set(false);
        } else {
          this.isProcessing.set(false);
        }
        return;
      }

      if (this.fundingStep() === 'card') {
        this.isProcessing.set(true);
        // Step 1: Initiate Deposit
        this.transactionService.initiateDeposit(customerId, amount).subscribe({
          next: (res) => {
            const ref = res.data.transref;
            this.currentReference.set(ref);

            // Step 2: Extract Expiry
            const [month, year] = this.expiryDate().split('/');

            // Step 3: Charge Card
            this.transactionService.chargeCard({
              reference: ref,
              cardNumber: this.cardNumber().replace(/\s/g, ''),
              expiryMonth: month,
              expiryYear: '20' + year,
              cvv: this.cvv(),
              pin: this.cardPin()
            }).subscribe({
              next: (chargeRes) => {
                const data = chargeRes.data;
                const body = data?.responseBody || data?.ResponseBody;
                const status = body?.status || body?.Status || data?.status;
                const rCode = data?.responseCode || data?.ResponseCode;

                if (status === 'OTP_AUTH_REQUIRED' || status === 'OTP_AUTHORIZATION_REQUIRED' || status?.includes('OTP')) {
                  const otpMsg = body?.otpData?.message || body?.message || 'Please enter the OTP sent to your phone/email';
                  this.otpMessage.set(otpMsg);
                  this.currentChargeId.set(body?.otpData?.id || '');
                  this.fundingStep.set('otp');
                  this.isProcessing.set(false);
                } else if (status === 'SUCCESS' || rCode === '0' || rCode === '00') {
                  this.finalizeDeposit();
                } else {
                  this.errorMessage.set(body?.message || body?.Message || data?.message || data?.responseMessage || 'Charge failed');
                  this.isProcessing.set(false);
                }
              },
              error: (err) => {
                this.errorMessage.set('Card processing error');
                this.isProcessing.set(false);
              }
            });
          },
          error: () => this.isProcessing.set(false)
        });
        return;
      }

      if (this.fundingStep() === 'otp') {
        this.isProcessing.set(true);
        this.transactionService.authorizeDeposit({
          reference: this.currentReference(),
          id: this.currentChargeId(),
          otp: this.otpInput()
        }).subscribe({
          next: () => {
            this.finalizeDeposit();
          },
          error: () => {
            this.errorMessage.set('Authorization failed');
            this.isProcessing.set(false);
          }
        });
        return;
      }
    } else {
      // Withdrawal logic
      try {
        this.errorMessage.set('');

        const currentUser = this.user();
        const is2faEnabled = currentUser?.is2faEnabled || currentUser?.Is2faEnabled || false;
        const customerId = currentUser?.CustomerId || currentUser?.customerId || currentUser?.id || currentUser?.Id;
        const amount = Number(this.transactionAmount().replace(/,/g, ''));

        if (!amount || amount <= 0) {
          this.errorMessage.set('Please enter a valid amount');
          return;
        }

        if (!customerId) {
          this.errorMessage.set('Customer profile not found. Please log in again.');
          return;
        }

        if (!this.withdrawAccountId()) {
          this.errorMessage.set('Please select a receiving bank account');
          return;
        }

        this.isProcessing.set(true);

        // NEW FLOW: amount -> [otp] -> pin -> finalize

        if (this.fundingStep() === 'amount') {
          if (is2faEnabled) {
            console.log('DEBUG: Sending Withdrawal OTP...');
            this.transactionService.sendWithdrawalOtp(Number(customerId), amount).subscribe({
              next: (res) => {
                this.isProcessing.set(false);
                if (res.success || res.boolean) {
                  this.fundingStep.set('otp');
                  this.otpMessage.set('A verification code has been sent to your email.');
                  this.startOtpCountdown();
                } else {
                  this.errorMessage.set(res.message || 'Failed to send OTP');
                }
              },
              error: (err) => {
                this.isProcessing.set(false);
                this.errorMessage.set(err.error?.message || 'Error sending OTP');
              }
            });
          } else {
            this.fundingStep.set('pin');
            this.isProcessing.set(false);
          }
          return;
        }

        if (this.fundingStep() === 'otp') {
          const otp = this.otpInput();
          if (!otp || otp.length < 6) {
            this.errorMessage.set('Please enter the 6-digit OTP sent to your email');
            this.isProcessing.set(false);
            return;
          }

          this.transactionService.validateWithdrawalOtp(Number(customerId), otp).subscribe({
            next: (res) => {
              this.isProcessing.set(false);
              if (res.success || res.boolean) {
                this.fundingStep.set('pin');
              } else {
                this.errorMessage.set(res.message || 'The OTP code you entered is incorrect.');
              }
            },
            error: (err) => {
              this.isProcessing.set(false);
              this.errorMessage.set(err.error?.message || 'Failed to verify OTP');
            }
          });
          return;
        }

        if (this.fundingStep() === 'pin') {
          if (!this.withdrawPin() || this.withdrawPin().length < 6) {
            this.errorMessage.set('Please enter your 6-digit transaction PIN');
            this.isProcessing.set(false);
            return;
          }
          this.finalizeWithdrawal();
        }
      } catch (err: any) {
        console.error('CRITICAL: Withdrawal Process Crashed', err);
        this.errorMessage.set('An internal error occurred: ' + (err.message || 'Unknown error'));
        this.isProcessing.set(false);
      }
    }
  }

  submitManualTransfer() {
    this.isProcessing.set(true);
    const amount = Number(this.transactionAmount().replace(/,/g, ''));

    this.transactionService.submitManualFunding({
      amount: amount,
      reference: 'N/A',
      receiptPath: this.manualReceiptPath(),
      receiptFile: this.manualReceiptFile()
    }).subscribe({
      next: (res) => {
        this.isProcessing.set(false);
        this.fundingStep.set('success');
        this.loadDashboardData();
        setTimeout(() => this.closeTransactionModal(), 3000);
      },
      error: (err) => {
        this.isProcessing.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to submit request');
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: err.error?.message || 'Please try again later.',
          confirmButtonColor: 'var(--dogo-primary)'
        });
      }
    });
  }

  finalizeWithdrawal() {
    try {
      this.isProcessing.set(true);
      const rawAmount = (this.transactionAmount() || "").toString().replace(/[^0-9]/g, '');
      const amount = Number(rawAmount);
      const currentUser = this.user();
      const customerId = currentUser?.CustomerId || currentUser?.customerId || currentUser?.id || currentUser?.Id;

      const selectedBank = this.registeredBanks().find(b => {
        const bId = (b.customerBankId || b.bankId || 0).toString();
        return bId === this.withdrawAccountId();
      });

      if (!selectedBank) {
        window.alert('ERROR: Bank not selected');
        console.error('DEBUG: Bank not found for ID', this.withdrawAccountId());
        this.errorMessage.set('Receiving bank account not found.');
        this.isProcessing.set(false);
        return;
      }

      const withdrawalData = {
        customerId: Number(customerId),
        amount: amount,
        bankCode: selectedBank.bankCode,
        accountNumber: selectedBank.accountNumber,
        pin: this.withdrawPin(),
        narration: `Withdrawal to ${selectedBank.bankName}`,
        otp: this.otpInput()
      };

      console.log('DEBUG: finalizeWithdrawal calling Service...', withdrawalData);

      this.transactionService.initiateWithdrawal(withdrawalData).pipe(
        timeout(60000),
        catchError(err => {
          console.error('Withdrawal Transaction Failed/Timed-out', err);
          this.isProcessing.set(false);
          const msg = err.name === 'TimeoutError' ? 'Request timed out. Please try again.' : (err.error?.message || 'Server connection failed');
          this.errorMessage.set(msg);
          return throwError(() => err);
        })
      ).subscribe({
        next: (res) => {
          console.error('DEBUG: Withdrawal Response Received', res);
          this.isProcessing.set(false);
          if (res.success || res.boolean) {
            this.closeTransactionModal();
            this.loadDashboardData();
            Swal.fire({
              title: 'Withdrawal Initialized',
              text: res.message || 'Your withdrawal is being processed.',
              icon: 'success',
              confirmButtonColor: 'var(--dogo-primary)'
            });
          } else {
            this.errorMessage.set(res.message || 'Withdrawal failed');
          }
        },
        error: (err) => {
          this.isProcessing.set(false);
        }
      });
    } catch (err: any) {
      console.error('CRITICAL: finalizeWithdrawal Crashed', err);
      this.errorMessage.set('Internal error: ' + err.message);
      this.isProcessing.set(false);
    }
  }

  finalizeDeposit() {
    this.transactionService.confirmDeposit(this.currentReference()).subscribe({
      next: () => {
        this.isProcessing.set(false);
        this.fundingStep.set('success');
        this.loadDashboardData(); // Refresh actual balance from backend
        setTimeout(() => this.closeTransactionModal(), 3000);
      },
      error: () => {
        this.errorMessage.set('Verification failed. Contact support if debited.');
        this.isProcessing.set(false);
      }
    });
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    // Maybe show a toast
  }

  getIconForType(type: string) {
    switch (type) {
      case 'deposit': return 'ri-arrow-down-circle-fill text-green-500';
      case 'withdrawal': return 'ri-arrow-up-circle-fill text-red-500';
      case 'profit': return 'ri-medal-fill text-[var(--dogo-secondary)]';
      default: return 'ri-briefcase-4-fill text-blue-500';
    }
  }

  getIconForTypeSingle(type: string) {
    switch (type) {
      case 'deposit': return 'ri-arrow-down-circle-fill';
      case 'withdrawal': return 'ri-arrow-up-circle-fill';
      case 'profit': return 'ri-medal-fill';
      default: return 'ri-briefcase-4-fill';
    }
  }

  getIconBgColor(type: string) {
    switch (type) {
      case 'deposit': return 'bg-green-500';
      case 'withdrawal': return 'bg-red-500';
      case 'profit': return 'bg-[var(--dogo-secondary)]';
      default: return 'bg-blue-500';
    }
  }

  onAmountInput(event: Event, type: 'fund' | 'invest' = 'fund') {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Digits only

    // Remove leading zeros
    if (value.length > 1 && value.startsWith('0')) {
      value = value.replace(/^0+/, '');
    }

    const formatted = this.formatWithCommas(value);

    if (type === 'invest') {
      this.investAmount.set(value);
    } else {
      this.transactionAmount.set(value);
    }

    input.value = formatted;
  }

  formatWithCommas(value: string): string {
    if (!value) return '';
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  onCardNumberInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Remove non-digits

    const determinedType = this.detectCardType(value);
    this.cardType.set(determinedType);

    let maxDigits = 19;
    if (determinedType === 'amex') maxDigits = 15;
    if (determinedType === 'mastercard') maxDigits = 16;

    if (value.length > maxDigits) value = value.slice(0, maxDigits);

    let formatted = value;
    if (determinedType === 'amex') {
      const p1 = value.slice(0, 4);
      const p2 = value.slice(4, 10);
      const p3 = value.slice(10, 15);
      formatted = p1 + (p2 ? ' ' + p2 : '') + (p3 ? ' ' + p3 : '');
    } else {
      formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    }

    this.cardNumber.set(formatted);
    input.value = formatted;
  }

  onExpiryInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);

    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }

    this.expiryDate.set(value);
    input.value = value;
  }
}


