import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../shared/services/auth.service';
import { CustomerService } from '../../../shared/services/customer.service';
import { ProductService } from '../../../shared/services/product.service';
import { InvestmentService } from '../../../shared/services/investment.service';
import { Product } from '../../../shared/models/product.model';
import { TransactionService } from '../../../shared/services/transaction.service';

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
  
  // Signals for state management
  user = this.authService.currentUser;
  portfolios = this.productService.portfolios;
  suggestedPortfolios = computed(() => this.portfolios().filter(p => p.isActive).slice(0, 3));

  showInvestModal = signal(false);
  showDetailModal = signal(false);
  selectedPortfolio = signal<Product | null>(null);
  investAmount = signal<number>(0);
  isInvesting = signal(false);
  
  userName = computed(() => {
    const u = this.user();
    return u?.firstName ? `${u.firstName} ${u.lastName}` : 'Dogo User';
  });

  availableNaira = signal(150240);
  hideBalances = signal(false); // New Privacy Signal

  totalActiveInvestment = computed(() => {
    return this.activeInvestments().reduce((acc, curr) => acc + curr.value, 0);
  });

  totalPortfolioValue = computed(() => {
    return this.totalActiveInvestment() + this.availableNaira();
  });

  activeInvestments = signal<InvestmentStub[]>([
    { label: 'Mudarabah Fund', value: 1200000, growth: 12.5, icon: 'ri-seedling-line', color: 'bg-[#1B4332]' },
    { label: 'Sukuk Bonds', value: 850000, growth: 8.2, icon: 'ri-bank-line', color: 'bg-[#C9A84C]' },
    { label: 'Halal Equity', value: 500000, growth: -2.1, icon: 'ri-line-chart-line', color: 'bg-[#0d1a0f]' },
    { label: 'Private Musharakah', value: 1550000, growth: 15.8, icon: 'ri-team-line', color: 'bg-[#2D6A4F]' }
  ]);

  nextSteps = signal<any[]>([]);

  ngOnInit() {
    this.productService.getPortfolios();
    this.loadTodoList();
    this.loadRelationshipTypes();
  }

  openInvest(portfolio: Product) {
    this.showDetailModal.set(false);
    this.selectedPortfolio.set(portfolio);
    this.showInvestModal.set(true);
    this.investAmount.set(0);
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
    this.investmentService.invest(this.selectedPortfolio()!.portfolioId, this.investAmount()).subscribe({
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

  recentTransactions = signal<Transaction[]>([
    { id: '1', type: 'profit', amount: 18500, status: 'completed', date: 'Today, 10:45 AM', description: 'Mudarabah Q1 profit share' },
    { id: '2', type: 'deposit', amount: 50000, status: 'completed', date: 'Yesterday', description: 'Wallet funding via Bank' },
    { id: '3', type: 'investment', amount: 200000, status: 'completed', date: '2 days ago', description: 'Sukuk Al-Ijarah Subscription' },
    { id: '4', type: 'withdrawal', amount: 12000, status: 'pending', date: '2 days ago', description: 'Withdraw to Zenith Bank' }
  ]);

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

  registeredBanks = signal<{id: string, bankName: string, accountNumber: string}[]>([
    { id: '1', bankName: 'Guaranty Trust Bank', accountNumber: '0123456789' },
    { id: '2', bankName: 'Zenith Bank', accountNumber: '2123456789' }
  ]);

  // Funding specific states
  fundingStep = signal<'amount' | 'source' | 'card' | 'otp' | 'virtual' | 'success'>('amount');
  selectedSource = signal<'card' | 'virtual' | null>(null);
  cardNumber = signal('');
  expiryDate = signal('');
  cvv = signal('');
  cardPin = signal('');
  otpInput = signal('');
  currentReference = signal('');
  errorMessage = signal('');

  virtualAccounts = signal<{bankName: string, accountName: string, accountNumber: string}[]>([
    { bankName: 'Sterling Bank', accountName: 'Sherifdeen Malik', accountNumber: '5309804611' },
    { bankName: 'Wema Bank', accountName: 'Sherifdeen Malik', accountNumber: '7829304112' }
  ]);

  // Computed signals
  totalGrowth = computed(() => {
    const assets = this.activeInvestments();
    return assets.reduce((acc, curr) => acc + (curr.value * (curr.growth / 100)), 0);
  });

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
    this.withdrawAccountId.set('');
    this.withdrawPin.set('');
    this.fundingStep.set('amount');
    this.selectedSource.set(null);
    this.cardNumber.set('');
    this.expiryDate.set('');
    this.cvv.set('');
    this.cardPin.set('');
    this.otpInput.set('');
    this.errorMessage.set('');
    this.showTransactionModal.set(true);
    this.isProcessing.set(false);
  }

  closeTransactionModal() {
    this.showTransactionModal.set(false);
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
           this.transactionService.getVirtualAccount().subscribe({
             next: (res) => {
               if (res.success && res.data) {
                 // The backend returns a single entity or list. Let's wrap as array for template.
                 const acc = res.data;
                 this.virtualAccounts.set([{
                    bankName: acc.bankName,
                    accountName: `${this.authService.currentUser()?.firstName} ${this.authService.currentUser()?.lastName}`, // Use from auth for safety or acc
                    accountNumber: acc.accountNumber
                 }]);
                 this.fundingStep.set('virtual');
               } else {
                 this.errorMessage.set(res.message || 'Could not retrieve virtual account');
               }
               this.isProcessing.set(false);
             },
             error: () => {
               this.errorMessage.set('Error connecting to payment provider');
               this.isProcessing.set(false);
             }
           });
        } else {
           this.isProcessing.set(false);
        }
        return;
      }

      if (this.fundingStep() === 'card') {
        // Step 1: Initiate Deposit
        this.transactionService.initiateDeposit(customerId, amount).subscribe({
          next: (res) => {
             const ref = res.data.reference;
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
                   if (chargeRes.data?.status === 'OTP_AUTH_REQUIRED' || chargeRes.data?.responseCode === '00') {
                      this.fundingStep.set('otp');
                      this.isProcessing.set(false);
                   } else if (chargeRes.data?.status === 'SUCCESS') {
                      this.finalizeDeposit();
                   } else {
                      this.errorMessage.set(chargeRes.data?.message || 'Charge failed');
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
      // Withdrawal logic ... maintains existing
      const amount = Number(this.transactionAmount());
      
      if(!this.withdrawAccountId() || !this.withdrawPin() || amount > this.availableNaira()) {
        this.isProcessing.set(false); return;
      }
      
      const selectedBank = this.registeredBanks().find(b => b.id === this.withdrawAccountId());
      const bankName = selectedBank ? selectedBank.bankName : 'Bank Transfer';

      setTimeout(() => {
        this.isProcessing.set(false);
        this.closeTransactionModal();
        this.availableNaira.update(val => val - amount);
        
        // Add to recent transactions statically
        this.recentTransactions.update(txs => [
          { id: Math.random().toString(), type: 'withdrawal', amount, status: 'completed', date: 'Just now', description: `Withdraw to ${bankName}` },
          ...txs
        ]);
      }, 1500);
    }
  }

  finalizeDeposit() {
    this.transactionService.confirmDeposit(this.currentReference()).subscribe({
      next: () => {
        this.isProcessing.set(false);
        this.fundingStep.set('success');
        this.availableNaira.update(val => val + Number(this.transactionAmount()));
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
}
