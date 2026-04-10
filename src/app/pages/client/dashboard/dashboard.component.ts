import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../shared/services/auth.service';
import { CustomerService } from '../../../shared/services/customer.service';
import { ProductService } from '../../../shared/services/product.service';
import { InvestmentService } from '../../../shared/services/investment.service';
import { Product } from '../../../shared/models/product.model';

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
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class ClientDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private customerService = inject(CustomerService);
  private productService = inject(ProductService);
  private investmentService = inject(InvestmentService);
  
  // Signals for state management
  user = this.authService.currentUser;
  products = this.productService.products;
  suggestedProducts = computed(() => this.products().filter(p => p.isActive).slice(0, 3));

  showInvestModal = signal(false);
  showDetailModal = signal(false);
  selectedProduct = signal<Product | null>(null);
  investAmount = signal<number>(100000);
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
    this.productService.getProducts();
    this.loadTodoList();
    this.loadRelationshipTypes();
  }

  openInvest(product: Product) {
    this.showDetailModal.set(false);
    this.selectedProduct.set(product);
    this.showInvestModal.set(true);
    this.investAmount.set(100000);
  }

  viewDetail(product: Product) {
    this.selectedProduct.set(product);
    this.showDetailModal.set(true);
  }

  getAssetColor(index: number): string {
    const colors = ['bg-[#1B4332]', 'bg-[#C9A84C]', 'bg-[#2D6A4F]', 'bg-[#0d1a0f]', 'bg-[#40916c]'];
    return colors[index % colors.length];
  }

  confirmInvestment() {
    if (!this.selectedProduct() || !this.investAmount()) return;
    this.isInvesting.set(true);
    this.investmentService.invest(this.selectedProduct()!.productId, this.investAmount()).subscribe({
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
        error: () => this.isProcessing.set(false)
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
          }
        },
        error: (err) => {
          console.error('PIN Setup Error:', err);
          this.isProcessing.set(false);
        }
      });
    } else {
      // Dummy processing for BVN/NIN for now
      setTimeout(() => {
        this.handleSuccessAction();
      }, 1500);
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
    
    if (this.transactionType() === 'fund') {
      // 1. Close our modal first so Monnify modal takes over without interference
      this.closeTransactionModal();

      // 2. Monnify SDK integration
      const monnify = (window as any).MonnifySDK;
      if(monnify) {
        monnify.initialize({
          amount: amount,
          currency: "NGN",
          reference: new String((new Date()).getTime()),
          customerFullName: this.userName(),
          customerEmail: "customer@example.com",
          apiKey: "MK_TEST_SAF7HR5F3F",
          contractCode: "1234567890",
          paymentDescription: "Wallet Funding",
          isTestMode: true,
          onComplete: (response: any) => {
            console.log("Monnify Payment Complete", response);
            this.availableNaira.update(val => val + amount);
            // Add to recent transactions statically
            this.recentTransactions.update(txs => [
              { id: Math.random().toString(), type: 'deposit', amount, status: 'completed', date: 'Just now', description: 'Wallet funding (Monnify)' },
              ...txs
            ]);
          },
          onClose: (data: any) => {
            console.log("Monnify Payment Modal Closed", data);
            this.isProcessing.set(false);
          }
        });
      } else {
         console.error('MonnifySDK is not loaded!');
         this.isProcessing.set(false);
      }
    } else {
      // Withdrawal logic (hits local backend, which would process Monnify disbursement server-side)
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
