import { Component, signal, computed, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../shared/services/auth.service';
import { CustomerService } from '../../../shared/services/customer.service';
import { ProductService } from '../../../shared/services/product.service';
import { InvestmentService } from '../../../shared/services/investment.service';
import { Product } from '../../../shared/models/product.model';
import { TransactionService } from '../../../shared/services/transaction.service';
import { DropdownComponent } from '../../../shared/components/ui/dropdown.component';
import { SettingsService, BankAccount } from '../settings/settings.service';

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'profit' | 'investment';
  amount: number;
  status: 'completed' | 'pending';
  date: string;
  description: string;
}

export interface InvestmentStub {
  label: string;
  value: number;
  growth: number;
  icon: string;
  color: string;
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
  isInvesting = signal(false);
  
  userName = computed(() => {
    const u = this.user();
    return u?.firstName ? `${u.firstName} ${u.lastName}` : 'Dogo User';
  });

  availableNaira = signal(0);
  actualInvestedValue = signal(0);
  portfolioGrowth = signal(12.5); // Placeholder for growth percentage
  hideBalances = signal(false); // New Privacy Signal

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
    // loadDashboardData is now triggered by the effect in constructor
    
    // Auto-refresh balance every 30 seconds for "real-time" feel
    const intervalId = setInterval(() => {
      this.loadDashboardData();
    }, 30000);
    
    // Cleanup on destroy logic would be good, but for now we'll just set it
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
                const mapped = data.map((tx: any) => ({
                    id: (tx.transactionId || tx.TransactionId || tx.id || tx.Id || Math.random())?.toString(),
                    type: ((tx.transactionType === 2 || tx.TransactionType === 2 || String(tx.narration || tx.Narration || '').toLowerCase().includes('withdraw')) ? 'withdrawal' : 'deposit') as 'deposit' | 'withdrawal' | 'profit' | 'investment',
                    amount: tx.amount || tx.Amount || tx.value || tx.Value || 0,
                    status: (tx.status === 1 || tx.Status === 1 || String(tx.status || '').toLowerCase() === 'success' || String(tx.status || '').toLowerCase() === 'completed') ? 'completed' : 'pending' as 'completed' | 'pending',
                    date: this.formatDate(tx.createdAt || tx.CreatedAt || tx.date || tx.Date || tx.transactionDate || tx.TransactionDate),
                    description: tx.narration || tx.Narration || tx.description || tx.Description || (tx.transactionType === 1 ? 'Deposit' : 'Withdrawal')
                }));
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

  openInvest(portfolio: Product) {
    this.showDetailModal.set(false);
    this.selectedPortfolio.set(portfolio);
    this.showInvestModal.set(true);
    this.investAmount.set('');
  }

  viewDetail(portfolio: Product) {
    this.selectedPortfolio.set(portfolio);
    this.showDetailModal.set(true);
  }

  getAssetColor(index: number): string {
    const colors = ['bg-[#1B4332]', 'bg-[#C9A84C]', 'bg-[#2D6A4F]', 'bg-[#0d1a0f]', 'bg-[#40916c]'];
    return colors[index % colors.length];
  }

  confirmInvestment() {
    if (!this.selectedPortfolio() || !this.investAmount()) return;
    this.isInvesting.set(true);
    this.investmentService.invest(this.selectedPortfolio()!.portfolioId, Number(this.investAmount())).subscribe({
      next: () => {
        this.isInvesting.set(false);
        this.showInvestModal.set(false);
        this.showDetailModal.set(false);
        // Refresh local balance stub for demo
        this.availableNaira.update(v => v + 50000); 
      },
      error: () => this.isInvesting.set(false)
    });
  }

  loadRelationshipTypes() {
    this.customerService.getRelationshipTypes().subscribe({
        next: (res) => {
            if (res.data) this.relationshipTypes.set(res.data);
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

  // Transaction Modal State
  showTransactionModal = signal(false);
  transactionType = signal<'fund'|'withdraw'>('fund');
  transactionAmount = signal('');
  withdrawAccountId = signal('');
  withdrawPin = signal('');

  registeredBanks = signal<BankAccount[]>([]);

  // Funding specific states
  fundingStep = signal<'amount' | 'source' | 'card' | 'otp' | 'virtual' | 'bvn' | 'success'>('amount');
  otpMessage = signal('');
  selectedSource = signal<'card' | 'virtual' | null>(null);
  cardNumber = signal('');
  expiryDate = signal('');
  cvv = signal('');
  cardPin = signal('');
  otpInput = signal('');
  currentReference = signal('');
  currentChargeId = signal('');
  errorMessage = signal('');

  virtualAccounts = signal<{bankName: string, accountName: string, accountNumber: string}[]>([]);

  cardType = signal<string>('');

  cardTypeIcon = computed(() => {
    switch (this.cardType()) {
      case 'visa': return 'ri-visa-fill text-blue-600';
      case 'mastercard': return 'fa-brands fa-cc-mastercard text-orange-500';
      case 'verve': return 'ri-bank-card-fill text-green-600';
      case 'amex': return 'fa-brands fa-cc-amex text-blue-400';
      default: return 'ri-bank-card-line text-[#1B4332]/20';
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
  }

  verifyAction() {
    const isPinFlow = this.activeVerification()?.title === 'Create Transaction PIN';
    const isNokFlow = this.activeVerification()?.title === 'Add Next of Kin';
    
    if (isPinFlow) {
      if (this.pinInput().length !== 6 || this.pinInput() !== this.confirmPinInput()) return;
    } else if (isNokFlow) {
      if (!this.nokName() || !this.nokEmail() || !this.nokPhone()) return;
    } else {
      if (this.verificationInput().length !== 11) return;
    }
    
    this.isProcessing.set(true);
    
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

  openTransactionModal(type: 'fund'|'withdraw') {
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
    this.errorMessage.set('');
    this.showTransactionModal.set(true);
    this.isProcessing.set(false);
  }

  closeTransactionModal() {
    this.showTransactionModal.set(false);
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
    if(!this.transactionAmount()) return;
    
    this.isProcessing.set(true);
    const amount = Number(this.transactionAmount());
    const customerId = this.user()?.CustomerId || this.user()?.customerId;
    
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
        } else {
           this.isProcessing.set(false);
        }
        return;
      }

      if (this.fundingStep() === 'card') {
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
      if (this.isProcessing()) return;
      this.isProcessing.set(true);
      this.errorMessage.set('');

      const amount = Number(this.transactionAmount());
      const customerId = this.user()?.CustomerId || this.user()?.customerId;
      const is2faEnabled = this.user()?.is2faEnabled || this.user()?.Is2faEnabled;

      if (!this.withdrawAccountId() || !this.withdrawPin()) {
        this.errorMessage.set('Please fill all fields');
        this.isProcessing.set(false);
        return;
      }

      if (is2faEnabled && this.fundingStep() !== 'otp') {
        // Step 1: Request OTP
        this.transactionService.sendWithdrawalOtp(customerId, amount).subscribe({
          next: (res) => {
            this.isProcessing.set(false);
            if (res.success || res.boolean) {
              this.fundingStep.set('otp');
              this.otpMessage.set('A verification code has been sent to your email to authorize this withdrawal.');
            } else {
              this.errorMessage.set(res.message || 'Failed to send verification code');
            }
          },
          error: (err) => {
            this.isProcessing.set(false);
            this.errorMessage.set(err.error?.message || 'Verification error');
          }
        });
      } else {
        // Step 2: Finalize (either no 2FA or OTP already entered)
        this.finalizeWithdrawal();
      }
    }
  }

  finalizeWithdrawal() {
    this.isProcessing.set(true);
    const amount = Number(this.transactionAmount());
    const customerId = this.user()?.CustomerId || this.user()?.customerId;
    const selectedBank = this.registeredBanks().find(b => (b.customerBankId || b.bankId || 0).toString() === this.withdrawAccountId());

    const withdrawalData = {
      customerId,
      amount,
      bankCode: selectedBank?.bankCode || '011', // Defaulting for demo safety
      accountNumber: selectedBank?.accountNumber || '',
      pin: this.withdrawPin(),
      narration: `Withdrawal to ${selectedBank?.bankName || 'Bank'}`,
      otp: this.otpInput()
    };

    this.transactionService.initiateWithdrawal(withdrawalData).subscribe({
      next: (res) => {
        this.isProcessing.set(false);
        if (res.success || res.boolean) {
          this.closeTransactionModal();
          this.loadDashboardData();
          // Show success stub
          this.recentTransactions.update(txs => [
            { id: Math.random().toString(), type: 'withdrawal', amount, status: 'completed', date: 'Just now', description: withdrawalData.narration },
            ...txs
          ]);
        } else {
          this.errorMessage.set(res.message || 'Withdrawal failed');
        }
      },
      error: (err) => {
        this.isProcessing.set(false);
        this.errorMessage.set(err.error?.message || 'Transaction could not be completed');
      }
    });
  }

  finalizeDeposit() {
    this.transactionService.confirmDeposit(this.currentReference()).subscribe({
      next: () => {
        this.isProcessing.set(false);
        this.fundingStep.set('success');
        this.loadDashboardData(); // Refresh actual balance from backend
        this.recentTransactions.update(txs => [
          { id: Math.random().toString(), type: 'deposit', amount: Number(this.transactionAmount()), status: 'completed', date: 'Just now', description: 'Wallet funding (Card)' },
          ...txs
        ]);
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
      case 'profit': return 'ri-medal-fill text-[#C9A84C]';
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
      case 'profit': return 'bg-[#C9A84C]';
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
