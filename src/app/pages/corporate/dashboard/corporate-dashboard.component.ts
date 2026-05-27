import { Component, signal, computed, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../shared/services/auth.service';

declare var Swal: any;
import { DropdownComponent } from '../../../shared/components/ui/dropdown.component';

export interface CorporateTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'profit' | 'investment';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  description: string;
  signatories?: string;
}

@Component({
  selector: 'app-corporate-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DropdownComponent],
  templateUrl: './corporate-dashboard.component.html',
  styleUrl: './corporate-dashboard.component.css'
})
export class CorporateDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor() {
    // Reactively load and sync data when user is available or component boots
    effect(() => {
      this.loadTodoList();
      this.loadDashboardData();
    });
  }

  // Identity / Profile signals
  user = this.authService.currentUser;
  companyName = signal('Bayero Corporate Reserves Ltd');
  userName = signal('Malik Sherifdeen');

  // Privacy / Display State
  hideBalances = signal(false);

  // Financial reserve signals (corporate scale)
  availableNaira = signal(10450200.75); // Liquid Cash Reserves
  actualInvestedValue = signal(15000000.00); // Term Placements
  portfolioGrowth = signal(13.4);
  totalProfit = signal(2010000.00);

  totalActiveInvestment = computed(() => {
    return this.actualInvestedValue();
  });

  totalPortfolioValue = computed(() => {
    return this.actualInvestedValue() + this.availableNaira();
  });

  totalGrowth = computed(() => {
    return this.actualInvestedValue() * (this.portfolioGrowth() / 100);
  });

  // Recommended Products (matching corporate settings placements)
  suggestedPortfolios = signal<any[]>([
    {
      portfolioId: 'p-1',
      name: 'Lotus Corporate Sukuk Fund',
      expectedAnnualReturn: 14.5,
      riskLevel: 'Low',
      description: 'Institutional Islamic bonds backed by sovereign infrastructure assets. No Riba, highly secure yield.'
    },
    {
      portfolioId: 'p-2',
      name: 'Murabaha Business Liquidity Reserve',
      expectedAnnualReturn: 12.8,
      riskLevel: 'Low',
      description: 'Shariah-compliant commodities buyback reserves. Best suited for short-term corporate excess liquidity.'
    },
    {
      portfolioId: 'p-3',
      name: 'Dogo Halal Real Estate Asset Fund',
      expectedAnnualReturn: 18.2,
      riskLevel: 'Medium',
      description: 'Diversified high-growth commercial real estate equity investments. Backed by physical brick-and-mortar assets.'
    }
  ]);

  // Active Investments list
  activeInvestments = signal<any[]>([
    { label: 'Lotus Corporate Sukuk Fund', value: 10000000.00, growth: 14.5, icon: 'ri-scales-line', color: 'bg-[var(--dogo-primary)]' },
    { label: 'Dogo Halal Real Estate Asset Fund', value: 5000000.00, growth: 18.2, icon: 'ri-building-4-line', color: 'bg-orange-500' }
  ]);

  // Dynamic checklist & transactions state
  nextSteps = signal<any[]>([]);
  recentTransactions = signal<CorporateTransaction[]>([]);

  // Linked Bank accounts loaded from settings
  nairaAccounts = signal<any[]>([]);
  domiciliaryAccounts = signal<any[]>([]);

  // Investment Modals State
  showInvestModal = signal(false);
  showDetailModal = signal(false);
  selectedPortfolio = signal<any | null>(null);
  investAmount = signal<string>('');
  investStep = signal<'amount' | 'bvn' | 'pin' | 'otp'>('amount');
  investPin = signal<string>('');
  investOtp = signal<string>('');
  isInvesting = signal(false);
  investBvn = signal<string>('');

  otpCountdown = signal(60);
  canResendOtp = signal(false);
  private countdownInterval: any;

  // Onboarding Checklist Modals State
  showVerificationModal = signal(false);
  activeVerification = signal<any>(null);
  verificationInput = signal('');
  pinInput = signal('');
  confirmPinInput = signal('');
  nokName = signal('');
  nokRelationshipId = signal<number | string>('');
  nokEmail = signal('');
  nokPhone = signal('');
  relationshipTypeOptions = signal<any[]>([]);
  isProcessing = signal(false);
  isSuccess = signal(false);

  // File Upload State inside checklist
  addressDocType = signal('');
  addressFile = signal<File | null>(null);
  addressFilePreview = signal<string | null>(null);
  addressDocOptions = signal<any[]>([
    { value: 'cac_doc', label: 'CAC Document Scan' },
    { value: 'signatory_id', label: 'Authorized Signatory ID Card' },
    { value: 'board_res', label: 'Board Resolution Document' }
  ]);

  // Funding & Withdrawal Modal State
  showTransactionModal = signal(false);
  transactionType = signal<'fund'|'withdraw'>('fund');
  transactionAmount = signal<string>('');
  withdrawAccountId = signal<string>('');
  withdrawPin = signal<string>('');
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

  companyBankDetails = signal({
    bankName: 'Rand Merchant Bank',
    accountName: 'Bayero Corporate Reserves Ltd',
    accountNumber: '1000152204'
  });

  manualReference = signal('');
  manualReceiptPath = signal('');
  virtualAccounts = signal<any[]>([
    { bankName: 'Rand Merchant Bank', accountName: 'Bayero Corporate Reserves Ltd', accountNumber: '1000152204' },
    { bankName: 'Lotus Bank Ltd', accountName: 'Bayero Corporate Reserves Ltd', accountNumber: '0012948190' }
  ]);

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

  registeredBankOptions = computed(() => {
    const naira = this.nairaAccounts().map(acc => ({
      value: acc.accountNumber,
      label: `NGN - ${acc.bankName} (${acc.accountNumber})`
    }));
    const dom = this.domiciliaryAccounts().map(acc => ({
      value: acc.accountNumber,
      label: `USD - ${acc.bankName} (${acc.accountNumber})`
    }));
    return [...naira, ...dom];
  });

  ngOnInit() {
    this.loadTodoList();
    this.loadDashboardData();

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
  }

  isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  loadDashboardData() {
    if (!this.isBrowser()) {
      this.availableNaira.set(10450200.75);
      this.actualInvestedValue.set(15000000.00);
      return;
    }
    // 1. Load reserves
    let storedBalances = localStorage.getItem('corporate_balances');
    if (storedBalances) {
      const b = JSON.parse(storedBalances);
      this.availableNaira.set(b.availableNaira || 10450200.75);
      this.actualInvestedValue.set(b.actualInvestedValue || 15000000.00);
    } else {
      const defaultBalances = {
        availableNaira: 10450200.75,
        actualInvestedValue: 15000000.00
      };
      localStorage.setItem('corporate_balances', JSON.stringify(defaultBalances));
    }

    // 2. Load treasury transactions
    let storedTxs = localStorage.getItem('corporate_transactions');
    if (storedTxs) {
      this.recentTransactions.set(JSON.parse(storedTxs));
    } else {
      const defaultTxs: CorporateTransaction[] = [
        {
          id: 'tx-1',
          type: 'deposit',
          description: 'Reserve Capital Allocation - Inflow',
          amount: 5000000.00,
          date: 'Today, 10:24 AM',
          status: 'completed',
          signatories: 'Approved by Malik S. & Ado B.'
        },
        {
          id: 'tx-2',
          type: 'withdrawal',
          description: 'Vendor Settlement Payout - Outflow',
          amount: 1200000.00,
          date: 'Yesterday, 4:15 PM',
          status: 'completed',
          signatories: 'Approved by Malik S. & Ado B.'
        },
        {
          id: 'tx-3',
          type: 'investment',
          description: 'Lotus Corporate Sukuk Fund - Asset Placement',
          amount: 10000000.00,
          date: 'May 20, 2026',
          status: 'completed',
          signatories: 'System Auto-invest Placement'
        }
      ];
      this.recentTransactions.set(defaultTxs);
      localStorage.setItem('corporate_transactions', JSON.stringify(defaultTxs));
    }

    // 3. Load bank accounts
    const naira = localStorage.getItem('corporate_naira_accounts');
    if (naira) {
      this.nairaAccounts.set(JSON.parse(naira));
    } else {
      const defaultNaira = [
        { bankId: 1, bankName: 'Jaiz Bank PLC', accountNumber: '0019284712', accountName: 'Bayero Corporate Reserves Ltd', bankBranch: 'Kano Main Branch', isDefault: true },
        { bankId: 5, bankName: 'Rand Merchant Bank', accountNumber: '1000152204', accountName: 'ZEDCREST PRIVATE PORTFOLIO NAIRA', bankBranch: 'Lagos Main Branch', isDefault: false },
        { bankId: 5, bankName: 'Rand Merchant Bank', accountNumber: '1000150808', accountName: 'MTL ZEDCREST MMF COLLECTION ACCOUNT', bankBranch: 'Ikoyi Branch', isDefault: false }
      ];
      this.nairaAccounts.set(defaultNaira);
      localStorage.setItem('corporate_naira_accounts', JSON.stringify(defaultNaira));
    }

    const dom = localStorage.getItem('corporate_dom_accounts');
    if (dom) {
      this.domiciliaryAccounts.set(JSON.parse(dom));
    } else {
      const defaultDom = [
        {
          bankId: 5,
          bankName: 'Rand Merchant Bank',
          accountNumber: '1000152194',
          accountName: 'Bayero Corporate Reserves Ltd (USD)',
          correspondentBank: 'BANK OF AMERICA NEW YORK',
          sortCode: '02-04-05',
          iban: 'US12BOFA0001000152194',
          swiftCode: 'FIRNNGLA',
          beneficiaryAccountName: 'ZEDCREST DOLLAR WALLET',
          beneficiaryAccountNo: '1000167653',
          beneficiaryAddress: 'Plot 2, Kingsway Road, Ikoyi, Lagos',
          forFurtherCredit: 'Bayero Reserves Sub-Account',
          isDefault: true
        }
      ];
      this.domiciliaryAccounts.set(defaultDom);
      localStorage.setItem('corporate_dom_accounts', JSON.stringify(defaultDom));
    }
  }

  loadTodoList() {
    if (!this.isBrowser()) return;
    let stored = localStorage.getItem('corporate_verifications');
    let verificationsList = [];
    if (stored) {
      verificationsList = JSON.parse(stored);
    } else {
      verificationsList = [
        { name: '1. Completed Application Form', type: 'appForm', status: 'verified', icon: 'ri-file-list-3-line', date: 'May 20, 2026' },
        { name: '2. Certificate of Incorporation', type: 'incorporation', status: 'verified', icon: 'ri-verified-badge-line', date: 'May 20, 2026' },
        { name: '3. Passport Photography of each Authorized Signatory', type: 'passport', status: 'verified', icon: 'ri-user-line', date: 'May 21, 2026' },
        { name: '4. Memorandum & Articles of Association', type: 'memart', status: 'verified', icon: 'ri-book-read-line', date: 'May 20, 2026' },
        { name: '5. Form CAC 2 (Return of Allotment of Shares)', type: 'cac2', status: 'pending', icon: 'ri-pie-chart-line', date: 'May 26, 2026' },
        { name: '6. Form CAC 7 (Particulars of Directors)', type: 'cac7', status: 'pending', icon: 'ri-folder-user-line', date: 'May 26, 2026' },
        { name: '7. Form CAC 3 (Notice of Situation/Change of Registered Address)', type: 'cac3', status: 'unverified', icon: 'ri-map-pin-user-line', date: 'N/A' },
        { name: '8. Copy of Identification of Authorized Signatories and Directors', type: 'signatoryId', status: 'unverified', icon: 'ri-shield-user-line', date: 'N/A' },
        { name: '9. Board Resolution/minutes of meeting confirming Authorized Signatories', type: 'boardResolution', status: 'unverified', icon: 'ri-team-line', date: 'N/A' }
      ];
      localStorage.setItem('corporate_verifications', JSON.stringify(verificationsList));
    }

    const filtered = verificationsList.filter((v: any) => v.status === 'pending' || v.status === 'unverified');

    const mapped = filtered.map((v: any) => ({
      title: v.name.replace(/^\d+\.\s*/, ''),
      desc: v.status === 'pending' 
        ? 'Awaiting corporate compliance review and approval.' 
        : 'Please upload this required corporate document to verify your business.',
      icon: v.icon || 'ri-checkbox-circle-line',
      action: v.status === 'pending' ? 'PENDING REVIEW' : 'UPLOAD NOW',
      status: v.status,
      type: v.type,
      originalName: v.name
    }));

    // Check if there are zero bank accounts linked
    let storedNaira = localStorage.getItem('corporate_naira_accounts');
    let storedDom = localStorage.getItem('corporate_dom_accounts');
    let nairaList = storedNaira ? JSON.parse(storedNaira) : [];
    let domList = storedDom ? JSON.parse(storedDom) : [];
    
    if (nairaList.length === 0 && domList.length === 0) {
      mapped.unshift({
        title: 'Link Settlement Account',
        desc: 'A linked local Naira or USD Domiciliary settlement bank account is required to activate reserve withdrawals.',
        icon: 'ri-bank-line',
        action: 'LINK ACCOUNT',
        status: 'unverified',
        type: 'settlement_link',
        originalName: 'Link Settlement Account'
      });
    }

    this.nextSteps.set(mapped);
  }

  // --- Investment Product Actions ---
  viewDetail(portfolio: any) {
    this.selectedPortfolio.set(portfolio);
    this.showDetailModal.set(true);
  }

  openInvest(portfolio: any) {
    this.showDetailModal.set(false);
    this.selectedPortfolio.set(portfolio);
    this.investAmount.set('');
    this.investStep.set('amount');
    this.investPin.set('');
    this.investOtp.set('');
    this.investBvn.set('');
    this.showInvestModal.set(true);
  }

  quickFund() {
    const amount = this.investAmount();
    this.showInvestModal.set(false);
    this.transactionAmount.set(amount);
    this.openTransactionModal('fund');
  }

  confirmInvestment() {
    if (!this.isBrowser()) return;
    if (!this.selectedPortfolio() || !this.investAmount()) return;
    
    const amount = Number(this.investAmount().replace(/,/g, ''));
    if (amount > this.availableNaira()) {
      Swal.fire({
        icon: 'error',
        title: 'Insufficient Balance',
        text: 'Your liquid treasury cash reserves are insufficient to make this placement.',
        confirmButtonColor: 'var(--dogo-primary)'
      });
      return;
    }

    this.isInvesting.set(true);

    setTimeout(() => {
      this.isInvesting.set(false);
      this.showInvestModal.set(false);

      // Mutate financial balances
      const updatedAvailable = this.availableNaira() - amount;
      const updatedInvested = this.actualInvestedValue() + amount;
      
      this.availableNaira.set(updatedAvailable);
      this.actualInvestedValue.set(updatedInvested);

      localStorage.setItem('corporate_balances', JSON.stringify({
        availableNaira: updatedAvailable,
        actualInvestedValue: updatedInvested
      }));

      // Add active investment item or update existing one
      this.activeInvestments.update(assets => {
        const existing = assets.find(a => a.label === this.selectedPortfolio().name);
        if (existing) {
          return assets.map(a => a.label === this.selectedPortfolio().name ? { ...a, value: a.value + amount } : a);
        } else {
          return [...assets, {
            label: this.selectedPortfolio().name,
            value: amount,
            growth: this.selectedPortfolio().expectedAnnualReturn,
            icon: 'ri-pie-chart-2-fill',
            color: 'bg-[var(--dogo-primary)]'
          }];
        }
      });

      // Add to recent activity
      const newTx: CorporateTransaction = {
        id: 'tx-' + Math.random().toString(36).substr(2, 9),
        type: 'investment',
        description: `${this.selectedPortfolio().name} - Placement`,
        amount: amount,
        date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'completed',
        signatories: 'Approved by Malik S. & Ado B.'
      };

      this.recentTransactions.update(txs => {
        const updated = [newTx, ...txs];
        localStorage.setItem('corporate_transactions', JSON.stringify(updated));
        return updated;
      });

      Swal.fire({
        icon: 'success',
        title: 'Investment Successful',
        text: `Successfully placed ₦${amount.toLocaleString()} in ${this.selectedPortfolio().name}.`,
        confirmButtonColor: 'var(--dogo-primary)',
        background: 'var(--dogo-cream)',
        customClass: { popup: 'rounded-[30px]' }
      });
    }, 1500);
  }

  // --- OTP Verification Logic ---
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
    this.isInvesting.set(true);
    setTimeout(() => {
      this.isInvesting.set(false);
      this.startOtpCountdown();
      Swal.fire({
        icon: 'success',
        title: 'New OTP Sent',
        text: 'A fresh authorization code has been sent to your primary contact email.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    }, 1000);
  }

  resendWithdrawalOtp() {
    if (!this.canResendOtp()) return;
    this.isProcessing.set(true);
    setTimeout(() => {
      this.isProcessing.set(false);
      this.startOtpCountdown();
      Swal.fire({
        icon: 'success',
        title: 'New OTP Sent',
        text: 'A fresh authorization code has been sent to your primary contact email.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    }, 1000);
  }

  // --- Dynamic Verification Card Actions ---
  openModal(step: any) {
    if (step.action === 'LINK ACCOUNT') {
      localStorage.setItem('settings_active_tab', 'banks');
      this.router.navigate(['/corporate/settings']);
      return;
    }

    if (step.action === 'PENDING REVIEW') {
      Swal.fire({
        title: 'Verification In Progress',
        text: 'Our corporate compliance team is currently reviewing this document. We will notify you once verified.',
        icon: 'info',
        confirmButtonColor: 'var(--dogo-primary)',
        background: 'var(--dogo-cream)',
        customClass: { popup: 'rounded-[30px]' }
      });
      return;
    }

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

  verifyAction() {
    if (!this.isBrowser()) return;
    this.isProcessing.set(true);
    
    setTimeout(() => {
      this.isProcessing.set(false);
      this.isSuccess.set(true);

      // Mutate local storage checklist item status to 'pending'
      const active = this.activeVerification();
      let verificationsList = JSON.parse(localStorage.getItem('corporate_verifications') || '[]');
      
      const updated = verificationsList.map((item: any) =>
        item.type === active.type ? { ...item, status: 'pending', date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) } : item
      );
      
      localStorage.setItem('corporate_verifications', JSON.stringify(updated));

      setTimeout(() => {
        this.loadTodoList();
        this.closeModal();
      }, 1500);
    }, 1500);
  }

  // --- Funding & Withdrawal Transactions ---
  openTransactionModal(type: 'fund'|'withdraw') {
    this.transactionType.set(type);
    this.transactionAmount.set('');
    
    if (type === 'withdraw') {
      const first = this.nairaAccounts()[0];
      this.withdrawAccountId.set(first ? first.accountNumber : '');
    } else {
      this.withdrawAccountId.set('');
    }
    
    this.withdrawPin.set('');
    this.fundingStep.set('amount');
    this.selectedSource.set(null);
    this.cardNumber.set('');
    this.expiryDate.set('');
    this.cvv.set('');
    this.cardPin.set('');
    this.otpInput.set('');
    this.manualReference.set('');
    this.manualReceiptPath.set('');
    this.errorMessage.set('');
    this.showTransactionModal.set(true);
    this.isProcessing.set(false);
  }

  closeTransactionModal() {
    this.showTransactionModal.set(false);
  }

  fetchVirtualAccount() {
    this.isProcessing.set(true);
    setTimeout(() => {
      this.isProcessing.set(false);
      this.fundingStep.set('virtual');
    }, 1000);
  }

  verifyBvnInFlow() {
    if (this.verificationInput().length !== 11) return;
    this.isProcessing.set(true);
    setTimeout(() => {
      this.isProcessing.set(false);
      this.fetchVirtualAccount();
    }, 1200);
  }

  processTransaction() {
    if (!this.transactionAmount()) {
      this.errorMessage.set('Please enter an amount to proceed.');
      return;
    }
    
    this.errorMessage.set('');
    const amount = Number(this.transactionAmount().toString().replace(/[^0-9]/g, ''));
    
    if (this.transactionType() === 'fund') {
      if (this.fundingStep() === 'amount') {
        this.fundingStep.set('source');
        return;
      }

      if (this.fundingStep() === 'source') {
        if (this.selectedSource() === 'card') {
          this.fundingStep.set('card');
        } else if (this.selectedSource() === 'virtual') {
          this.fetchVirtualAccount();
        } else if (this.selectedSource() === 'manual') {
          this.fundingStep.set('manual');
        }
        return;
      }

      if (this.fundingStep() === 'card') {
        this.isProcessing.set(true);
        setTimeout(() => {
          this.isProcessing.set(false);
          this.fundingStep.set('otp');
          this.otpMessage.set('Please enter the 6-digit OTP sent to your phone/email to authorize this card.');
          this.startOtpCountdown();
        }, 1500);
        return;
      }

      if (this.fundingStep() === 'otp') {
        this.isProcessing.set(true);
        setTimeout(() => {
          this.finalizeDeposit();
        }, 1500);
        return;
      }
    } else {
      // Withdrawal Process
      if (amount > this.availableNaira()) {
        this.errorMessage.set('Withdrawal amount exceeds your active liquid reserves.');
        return;
      }

      if (this.fundingStep() === 'amount') {
        this.isProcessing.set(true);
        setTimeout(() => {
          this.isProcessing.set(false);
          this.fundingStep.set('otp');
          this.otpMessage.set('A validation code has been sent to your primary contact email.');
          this.startOtpCountdown();
        }, 1200);
        return;
      }

      if (this.fundingStep() === 'otp') {
        if (this.otpInput().length < 6) {
          this.errorMessage.set('Please enter the 6-digit verification code.');
          return;
        }
        this.fundingStep.set('pin');
        return;
      }

      if (this.fundingStep() === 'pin') {
        if (this.withdrawPin().length < 6) {
          this.errorMessage.set('Please enter your transaction security PIN.');
          return;
        }
        this.finalizeWithdrawal();
      }
    }
  }

  submitManualTransfer() {
    if (!this.isBrowser()) return;
    if (!this.manualReference()) return;
    this.isProcessing.set(true);
    const amount = Number(this.transactionAmount().replace(/,/g, ''));

    setTimeout(() => {
      this.isProcessing.set(false);
      this.fundingStep.set('success');

      // Add to recent activity
      const newTx: CorporateTransaction = {
        id: 'tx-' + Math.random().toString(36).substr(2, 9),
        type: 'deposit',
        description: 'Manual Bank Deposit Allocation',
        amount: amount,
        date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'pending',
        signatories: 'Awaiting Bank Receipt Approval'
      };

      this.recentTransactions.update(txs => {
        const updated = [newTx, ...txs];
        localStorage.setItem('corporate_transactions', JSON.stringify(updated));
        return updated;
      });

      this.loadDashboardData();
      setTimeout(() => this.closeTransactionModal(), 3000);
    }, 1500);
  }

  finalizeDeposit() {
    if (!this.isBrowser()) return;
    const amount = Number(this.transactionAmount().replace(/,/g, ''));
    
    // Update reserves
    const updatedAvailable = this.availableNaira() + amount;
    this.availableNaira.set(updatedAvailable);

    let balances = JSON.parse(localStorage.getItem('corporate_balances') || '{}');
    balances.availableNaira = updatedAvailable;
    localStorage.setItem('corporate_balances', JSON.stringify(balances));

    // Log transaction
    const newTx: CorporateTransaction = {
      id: 'tx-' + Math.random().toString(36).substr(2, 9),
      type: 'deposit',
      description: 'Card Deposit Inflow',
      amount: amount,
      date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'completed',
      signatories: 'Approved by Malik S. & Ado B.'
    };

    this.recentTransactions.update(txs => {
      const updated = [newTx, ...txs];
      localStorage.setItem('corporate_transactions', JSON.stringify(updated));
      return updated;
    });

    this.isProcessing.set(false);
    this.fundingStep.set('success');
    this.loadDashboardData();

    setTimeout(() => this.closeTransactionModal(), 3000);
  }

  finalizeWithdrawal() {
    if (!this.isBrowser()) return;
    this.isProcessing.set(true);
    const amount = Number(this.transactionAmount().replace(/,/g, ''));
    
    setTimeout(() => {
      this.isProcessing.set(false);

      // Update reserves
      const updatedAvailable = this.availableNaira() - amount;
      this.availableNaira.set(updatedAvailable);

      let balances = JSON.parse(localStorage.getItem('corporate_balances') || '{}');
      balances.availableNaira = updatedAvailable;
      localStorage.setItem('corporate_balances', JSON.stringify(balances));

      // Find receiving bank details
      const bank = [...this.nairaAccounts(), ...this.domiciliaryAccounts()].find(b => b.accountNumber === this.withdrawAccountId());
      const bankLabel = bank ? bank.bankName : 'Corporate Settlement Account';

      // Log transaction
      const newTx: CorporateTransaction = {
        id: 'tx-' + Math.random().toString(36).substr(2, 9),
        type: 'withdrawal',
        description: `Transfer to ${bankLabel}`,
        amount: amount,
        date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'completed',
        signatories: 'Approved by Malik S. & Ado B.'
      };

      this.recentTransactions.update(txs => {
        const updated = [newTx, ...txs];
        localStorage.setItem('corporate_transactions', JSON.stringify(updated));
        return updated;
      });

      this.closeTransactionModal();
      this.loadDashboardData();

      Swal.fire({
        title: 'Withdrawal Successful',
        text: `Your corporate treasury withdrawal of ₦${amount.toLocaleString()} has been processed.`,
        icon: 'success',
        confirmButtonColor: 'var(--dogo-primary)',
        background: 'var(--dogo-cream)',
        customClass: { popup: 'rounded-[30px]' }
      });
    }, 1500);
  }

  // --- Utility Helpers ---
  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    Swal.fire({
      icon: 'success',
      title: 'Copied!',
      text: 'Account number has been copied to clipboard.',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1500
    });
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
    let value = input.value.replace(/\D/g, '');
    
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
    let value = input.value.replace(/\D/g, '');
    
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

  isCardValid = computed(() => {
    const card = this.cardNumber().replace(/\s/g, '');
    const expiry = this.expiryDate();
    const cvv = this.cvv();
    const pin = this.cardPin();

    const type = this.cardType();
    let minLen = 16;
    if (type === 'amex') minLen = 15;

    if (card.length < minLen || !this.luhnCheck(card)) return false;
    
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
    const [m, y] = expiry.split('/').map(Number);
    if (m < 1 || m > 12) return false;
    
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    
    if (y < currentYear || (y === currentYear && m < currentMonth)) return false;
    if (cvv.length !== 3) return false;
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
}
