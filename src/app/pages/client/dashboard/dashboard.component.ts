import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class ClientDashboardComponent {
  // Signals for state management
  userName = signal('Ado Bayero');
  totalPortfolio = signal(4250000);
  availableNaira = signal(150240);
  hideBalances = signal(false); // New Privacy Signal

  activeInvestments = signal<InvestmentStub[]>([
    { label: 'Mudarabah Fund', value: 1200000, growth: 12.5, icon: 'ri-seedling-line', color: 'bg-[#1B4332]' },
    { label: 'Sukuk Bonds', value: 850000, growth: 8.2, icon: 'ri-bank-line', color: 'bg-[#C9A84C]' },
    { label: 'Halal Equity', value: 500000, growth: -2.1, icon: 'ri-line-chart-line', color: 'bg-[#0d1a0f]' },
    { label: 'Private Musharakah', value: 1550000, growth: 15.8, icon: 'ri-team-line', color: 'bg-[#2D6A4F]' }
  ]);

  nextSteps = signal([
    { title: 'Verify BVN', desc: 'Secure your financial records with BVN', icon: 'ri-fingerprint-line', action: 'Verify Now' },
    { title: 'Verify Your NIN', desc: 'Secure your account identity', icon: 'ri-shield-user-line', action: 'Verify Now' },
    { title: 'Create Transaction PIN', desc: 'Secure your wallet from unauthorized access', icon: 'ri-lock-password-line', action: 'Setup' },
    { title: 'Add Next of Kin', desc: 'Manage your wealth legacy', icon: 'ri-parent-line', action: 'Update' }
  ]);

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
  nokRelationship = signal('Brother');
  nokEmail = signal('');
  nokPhone = signal('');
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
    this.nokRelationship.set('Brother');
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
    
    // Dummy processing
    if (isPinFlow) {
      console.log(`Setting Transaction PIN: ${this.pinInput()}`);
    } else if (isNokFlow) {
      console.log(`Updating NOK: ${this.nokName()}, ${this.nokRelationship()}, ${this.nokEmail()}, ${this.nokPhone()}`);
    } else {
      console.log(`Verifying ${this.activeVerification().title}: ${this.verificationInput()}`);
    }
    
    setTimeout(() => {
      this.isProcessing.set(false);
      this.isSuccess.set(true);
      
      // Remove from list after success
      setTimeout(() => {
        const verifiedTitle = this.activeVerification()?.title;
        this.nextSteps.set(this.nextSteps().filter(s => s.title !== verifiedTitle));
        this.closeModal();
      }, 2000);
    }, 1500);
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
}
