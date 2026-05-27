import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BadgeComponent } from '../../../shared/components/ui/badge.component';
import { ButtonComponent } from '../../../shared/components/ui/button.component';
import { CardComponent } from '../../../shared/components/ui/card.component';
import { DropdownComponent, DropdownOption } from '../../../shared/components/ui/dropdown.component';

declare var Swal: any;

export type CorporateSettingsTab = 'profile' | 'verification' | 'banks' | 'signatories' | 'security';

@Component({
  selector: 'app-corporate-settings',
  standalone: true,
  imports: [CommonModule, BadgeComponent, ButtonComponent, CardComponent, FormsModule, DropdownComponent],
  templateUrl: './corporate-settings.component.html',
  styleUrl: './corporate-settings.component.css'
})
export class CorporateSettingsComponent {
  activeTab = signal<CorporateSettingsTab>('profile');

  constructor() {
    this.loadStateFromStorage();
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('settings_active_tab');
      if (savedTab) {
        this.activeTab.set(savedTab as CorporateSettingsTab);
        localStorage.removeItem('settings_active_tab');
      }
    }
  }

  loadStateFromStorage() {
    if (typeof window === 'undefined') return;
    
    const storedVerif = localStorage.getItem('corporate_verifications');
    if (storedVerif) {
      this.verifications.set(JSON.parse(storedVerif));
    } else {
      localStorage.setItem('corporate_verifications', JSON.stringify(this.verifications()));
    }

    const storedNaira = localStorage.getItem('corporate_naira_accounts');
    if (storedNaira) {
      this.nairaAccounts.set(JSON.parse(storedNaira));
    } else {
      localStorage.setItem('corporate_naira_accounts', JSON.stringify([]));
    }

    const storedDom = localStorage.getItem('corporate_dom_accounts');
    if (storedDom) {
      this.domiciliaryAccounts.set(JSON.parse(storedDom));
    } else {
      localStorage.setItem('corporate_dom_accounts', JSON.stringify([]));
    }

    this.checkSettlementLinkVerification();
  }


  // --- Corporate Profile State (ZEDCREST Form Fields) ---
  isEditingProfile = signal(false);
  isUpdatingProfile = signal(false);
  companyProfile = signal({
    companyName: 'Bayero Corporate Reserves Ltd',
    registrationNumber: 'RC-1294819',
    dateOfIncorporation: '2018-05-20',
    natureOfBusiness: 'Commodity Trading & Asset Placements',
    address: '22 Alhaji Kanike Close, Off Awolowo Road, Ikoyi, Lagos',
    entityType: 'Ltd',
    otherEntityType: '',
    phone: '0801 234 5678',
    tin: '21092847-0001',
    email: 'ado.bayero@bayerocorp.com',
    annualTurnover: '₦100M - ₦499.9M',
    sourceOfFunds: 'Corporate Reserves & Retained Business Inflow',
    clientSegmentation: 'Corporate'
  });
  editProfileForm = signal<any>({});

  // --- Primary Contact Person State (G. PRIMARY CONTACT PERSON) ---
  isEditingContact = signal(false);
  isUpdatingContact = signal(false);
  primaryContact = signal({
    fullName: 'Malik Sherifdeen',
    email: 'malik@bayerocorp.com',
    phone: '0803 123 4567'
  });
  editContactForm = signal<any>({});

  entityTypeOptions = signal<DropdownOption[]>([
    { value: 'Plc', label: 'Public Limited Company (Plc)', icon: 'ri-building-line' },
    { value: 'Ltd', label: 'Private Limited Company (Ltd)', icon: 'ri-building-4-line' },
    { value: 'Partnership', label: 'Partnership', icon: 'ri-group-line' },
    { value: 'Sole Partnership', label: 'Sole Partnership / Proprietorship', icon: 'ri-user-star-line' },
    { value: 'NGO', label: 'Non-Governmental Organisation (NGO)', icon: 'ri-heart-line' },
    { value: 'Others', label: 'Others (Please specify)', icon: 'ri-more-fill' }
  ]);

  turnoverOptions = signal<DropdownOption[]>([
    { value: 'Less than ₦50M', label: 'Less than ₦50M', icon: 'ri-money-dollar-circle-line' },
    { value: '₦50M - ₦99.9M', label: '₦50M - ₦99.9M', icon: 'ri-money-dollar-box-line' },
    { value: '₦100M - ₦499.9M', label: '₦100M - ₦499.9M', icon: 'ri-coins-line' },
    { value: '₦500M - ₦999.9M', label: '₦500M - ₦999.9M', icon: 'ri-bank-card-line' },
    { value: '₦1 Billion - ₦4.9 Billion', label: '₦1 Billion - ₦4.9 Billion', icon: 'ri-copper-coin-line' },
    { value: '₦5 Billion and above', label: '₦5 Billion and above', icon: 'ri-trophy-line' }
  ]);

  segmentationOptions = signal<DropdownOption[]>([
    { value: 'Institutional', label: 'Institutional', icon: 'ri-government-line' },
    { value: 'Corporate', label: 'Corporate', icon: 'ri-building-line' },
    { value: 'SME', label: 'Small & Medium Enterprise (SME)', icon: 'ri-store-2-line' }
  ]);

  // --- Corporate Verification State (Captured from Zedcrest Wealth Application Checklist) ---
  verifications = signal([
    { name: '1. Completed Application Form', type: 'appForm', status: 'verified', icon: 'ri-file-list-3-line', date: 'May 20, 2026' },
    { name: '2. Certificate of Incorporation', type: 'incorporation', status: 'verified', icon: 'ri-verified-badge-line', date: 'May 20, 2026' },
    { name: '3. Passport Photography of each Authorized Signatory', type: 'passport', status: 'verified', icon: 'ri-user-line', date: 'May 21, 2026' },
    { name: '4. Memorandum & Articles of Association', type: 'memart', status: 'verified', icon: 'ri-book-read-line', date: 'May 20, 2026' },
    { name: '5. Form CAC 2 (Return of Allotment of Shares)', type: 'cac2', status: 'pending', icon: 'ri-pie-chart-line', date: 'May 26, 2026' },
    { name: '6. Form CAC 7 (Particulars of Directors)', type: 'cac7', status: 'pending', icon: 'ri-folder-user-line', date: 'May 26, 2026' },
    { name: '7. Form CAC 3 (Notice of Situation/Change of Registered Address)', type: 'cac3', status: 'unverified', icon: 'ri-map-pin-user-line', date: 'N/A' },
    { name: '8. Copy of Identification of Authorized Signatories and Directors', type: 'signatoryId', status: 'unverified', icon: 'ri-shield-user-line', date: 'N/A' },
    { name: '9. Board Resolution/minutes of meeting confirming Authorized Signatories', type: 'boardResolution', status: 'unverified', icon: 'ri-team-line', date: 'N/A' },
    { name: '10. Link Settlement Bank Account', type: 'settlementLink', status: 'unverified', icon: 'ri-bank-line', date: 'N/A' }
  ]);
  showVerificationModal = signal(false);
  activeVerification = signal<any>(null);
  isVerifying = signal(false);
  isVerificationSuccess = signal(false);
  addressFile = signal<File | null>(null);
  addressFilePreview = signal<string | null>(null);

  // --- Corporate Bank Accounts State (Local & Domiciliary Dual-Category) ---
  nairaAccounts = signal<any[]>([]);
  domiciliaryAccounts = signal<any[]>([]);

  availableBanks = signal([
    { bankId: 1, bankName: 'Jaiz Bank PLC' },
    { bankId: 2, bankName: 'Lotus Bank Ltd' },
    { bankId: 3, bankName: 'TAJBank Ltd' },
    { bankId: 4, bankName: 'Stanbic IBTC Bank (Halal)' },
    { bankId: 5, bankName: 'Rand Merchant Bank' }
  ]);

  isAddingNaira = signal(false);
  isSavingNaira = signal(false);
  newNairaForm = signal<any>({ bankId: 5, accountNumber: '1000152204', accountName: 'Bayero Corporate Reserves Ltd', bankBranch: 'Lagos Main Branch' });

  isAddingDom = signal(false);
  isSavingDom = signal(false);
  newDomForm = signal<any>({
    bankId: 5,
    accountNumber: '1000152194',
    accountName: 'Bayero Corporate Reserves Ltd (USD)',
    correspondentBank: 'BANK OF AMERICA NEW YORK',
    sortCode: '02-04-05',
    iban: 'US12BOFA0001000152194',
    swiftCode: 'FIRNNGLA',
    beneficiaryAccountName: 'ZEDCREST DOLLAR WALLET',
    beneficiaryAccountNo: '1000167653',
    beneficiaryAddress: 'Plot 2, Kingsway Road, Ikoyi, Lagos',
    forFurtherCredit: 'Bayero Reserves Sub-Account'
  });

  bankOptions = computed<DropdownOption[]>(() =>
    this.availableBanks().map(b => ({
      value: b.bankId,
      label: b.bankName,
      icon: 'ri-bank-line'
    }))
  );

  // --- Signatories & Directors State (Dual-Category with Complete Profile Fields) ---
  selectedPerson = signal<any>(null);

  signatories = signal([
    {
      title: 'Mr',
      surname: 'Sherifdeen',
      firstName: 'Malik',
      otherNames: 'Alabi',
      designation: 'Managing Director',
      dob: '1985-04-12',
      residentialAddress: '22 Alhaji Kanike Close, Off Awolowo Road, Ikoyi, Lagos',
      email: 'malik@bayerocorp.com',
      phone: '0803 123 4567',
      bvn: '22194857102',
      nationality: 'Nigerian',
      gender: 'Male',
      idType: 'Int Passport',
      idNumber: 'A00129481',
      isPep: 'No',
      pepDetails: '',
      signingClass: 'A',
      passportPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
      signatureImage: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Foreman_Signature.png',
      idDocument: 'https://images.unsplash.com/photo-1554774853-719586f82d77?q=80&w=300',
      status: 'active'
    },
    {
      title: 'Mr',
      surname: 'Bayero',
      firstName: 'Ado',
      otherNames: 'Suleiman',
      designation: 'Chairman',
      dob: '1978-08-22',
      residentialAddress: 'Plot 45 Gwarinpa Estate, Abuja',
      email: 'ado@bayerocorp.com',
      phone: '0805 987 6543',
      bvn: '22147859301',
      nationality: 'Nigerian',
      gender: 'Male',
      idType: 'National ID Card',
      idNumber: '984712048591',
      isPep: 'Yes',
      pepDetails: 'Relative of former local council chairman',
      signingClass: 'A',
      passportPhoto: '',
      signatureImage: '',
      idDocument: '',
      status: 'active'
    }
  ]);

  directors = signal([
    {
      title: 'Mr',
      surname: 'Bayero',
      firstName: 'Ado',
      otherNames: 'Suleiman',
      designation: 'Chairman',
      dob: '1978-08-22',
      residentialAddress: 'Plot 45 Gwarinpa Estate, Abuja',
      email: 'ado@bayerocorp.com',
      phone: '0805 987 6543',
      bvn: '22147859301',
      nationality: 'Nigerian',
      gender: 'Male',
      idType: 'National ID Card',
      idNumber: '984712048591',
      isPep: 'Yes',
      pepDetails: 'Relative of former local council chairman',
      signingClass: 'A',
      passportPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop',
      signatureImage: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Foreman_Signature.png',
      idDocument: '',
      status: 'active'
    },
    {
      title: 'Mrs',
      surname: 'Bello',
      firstName: 'Zainab',
      otherNames: 'Aisha',
      designation: 'Executive Director',
      dob: '1990-11-05',
      residentialAddress: '15 Lekki Phase 1, Lagos',
      email: 'zainab@bayerocorp.com',
      phone: '0812 345 6789',
      bvn: '22384710928',
      nationality: 'Nigerian',
      gender: 'Female',
      idType: 'Driver\'s License',
      idNumber: 'DL-92847190A',
      isPep: 'No',
      pepDetails: '',
      signingClass: 'B',
      passportPhoto: '',
      signatureImage: '',
      idDocument: '',
      status: 'pending'
    }
  ]);

  isAddingSignatory = signal(false);
  isSavingSignatory = signal(false);
  newSignatoryForm = signal<any>({
    title: 'Mr',
    surname: '',
    firstName: '',
    otherNames: '',
    designation: 'Director / Signatory',
    dob: '',
    residentialAddress: '',
    email: '',
    phone: '',
    bvn: '',
    nationality: 'Nigerian',
    gender: 'Male',
    idType: 'Driver\'s License',
    idNumber: '',
    isPep: 'No',
    pepDetails: '',
    signingClass: 'A',
    passportPhoto: '',
    signatureImage: '',
    idDocument: ''
  });

  isAddingDirector = signal(false);
  isSavingDirector = signal(false);
  newDirectorForm = signal<any>({
    title: 'Mr',
    surname: '',
    firstName: '',
    otherNames: '',
    designation: 'Controlling Director',
    dob: '',
    residentialAddress: '',
    email: '',
    phone: '',
    bvn: '',
    nationality: 'Nigerian',
    gender: 'Male',
    idType: 'Driver\'s License',
    idNumber: '',
    isPep: 'No',
    pepDetails: '',
    signingClass: 'A',
    passportPhoto: '',
    signatureImage: '',
    idDocument: ''
  });

  // --- Corporate Security State ---
  isTwoFactorEnabled = signal(true);
  isUpdatingTwoFactor = signal(false);
  isEditingPin = signal(false);
  isUpdatingPin = signal(false);
  hasPin = signal(true);
  pinForm = signal({ oldPin: '', newPin: '', confirmPin: '' });
  pinError = signal('');

  setTab(tab: CorporateSettingsTab) {
    this.activeTab.set(tab);
  }

  getBadgeVariant(status: string): any {
    switch (status) {
      case 'verified': return 'success';
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'unverified': return 'danger';
      default: return 'info';
    }
  }

  // --- Profile Actions ---
  startEditProfile() {
    this.editProfileForm.set({ ...this.companyProfile() });
    this.isEditingProfile.set(true);
  }

  cancelEditProfile() {
    this.isEditingProfile.set(false);
  }

  saveProfile() {
    this.isUpdatingProfile.set(true);
    setTimeout(() => {
      this.companyProfile.set({ ...this.companyProfile(), ...this.editProfileForm() });
      this.isEditingProfile.set(false);
      this.isUpdatingProfile.set(false);

      Swal.fire({
        icon: 'success',
        title: 'Company Profile Updated',
        text: 'Your corporate business details have been successfully saved.',
        timer: 2000,
        showConfirmButton: false,
        background: 'var(--dogo-cream)',
        customClass: { popup: 'rounded-[30px]' }
      });
    }, 1200);
  }

  updateProfileField(field: string, value: string) {
    this.editProfileForm.set({ ...this.editProfileForm(), [field]: value });
  }

  // --- Primary Contact Actions ---
  startEditContact() {
    this.editContactForm.set({ ...this.primaryContact() });
    this.isEditingContact.set(true);
  }

  cancelEditContact() {
    this.isEditingContact.set(false);
  }

  saveContact() {
    this.isUpdatingContact.set(true);
    setTimeout(() => {
      this.primaryContact.set({ ...this.primaryContact(), ...this.editContactForm() });
      this.isEditingContact.set(false);
      this.isUpdatingContact.set(false);

      Swal.fire({
        icon: 'success',
        title: 'Primary Contact Updated',
        text: 'Primary contact details have been successfully saved.',
        timer: 2000,
        showConfirmButton: false,
        background: 'var(--dogo-cream)',
        customClass: { popup: 'rounded-[30px]' }
      });
    }, 1200);
  }

  updateContactField(field: string, value: string) {
    this.editContactForm.set({ ...this.editContactForm(), [field]: value });
  }

  // --- Verification Actions ---
  openVerificationModal(v: any) {
    if (v.status === 'verified') return;
    this.activeVerification.set(v);
    this.isVerificationSuccess.set(false);
    this.showVerificationModal.set(true);
  }

  closeVerificationModal() {
    this.showVerificationModal.set(false);
    this.activeVerification.set(null);
    this.addressFile.set(null);
    this.addressFilePreview.set(null);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.addressFile.set(file);
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.addressFilePreview.set(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  verifyDocument() {
    this.isVerifying.set(true);
    setTimeout(() => {
      this.isVerifying.set(false);
      this.isVerificationSuccess.set(true);

      const active = this.activeVerification();
      const updated = this.verifications().map(item =>
        item.type === active.type ? { ...item, status: 'pending', date: 'May 27, 2026' } : item
      );
      this.verifications.set(updated);
      localStorage.setItem('corporate_verifications', JSON.stringify(updated));

      setTimeout(() => this.closeVerificationModal(), 1500);
    }, 1500);
  }

  // --- Naira Bank Account Actions ---
  startAddNaira() {
    this.newNairaForm.set({ bankId: 1, accountNumber: '', accountName: this.companyProfile().companyName, bankBranch: 'Lagos Main Branch' });
    this.isAddingNaira.set(true);
  }

  cancelAddNaira() {
    this.isAddingNaira.set(false);
  }

  saveNaira() {
    this.isSavingNaira.set(true);
    setTimeout(() => {
      const selectedBank = this.availableBanks().find(b => b.bankId == this.newNairaForm().bankId);
      const newAcc = {
        bankId: this.newNairaForm().bankId,
        bankName: selectedBank ? selectedBank.bankName : 'Commercial Bank',
        accountNumber: this.newNairaForm().accountNumber,
        accountName: this.newNairaForm().accountName,
        bankBranch: this.newNairaForm().bankBranch,
        isDefault: false
      };
      this.nairaAccounts.update(accounts => {
        const updated = [...accounts, newAcc];
        localStorage.setItem('corporate_naira_accounts', JSON.stringify(updated));
        return updated;
      });
      this.checkSettlementLinkVerification();
      this.isAddingNaira.set(false);
      this.isSavingNaira.set(false);

      Swal.fire({
        icon: 'success',
        title: 'Naira Account Linked',
        text: 'Local Naira settlement account has been added successfully.',
        confirmButtonColor: 'var(--dogo-primary)',
        background: 'var(--dogo-cream)',
        customClass: { popup: 'rounded-[30px]' }
      });
    }, 1200);
  }

  deleteNaira(accountNumber: string) {
    Swal.fire({
      title: 'Remove Naira Account?',
      text: "You won't be able to withdraw corporate NGN reserves to this account.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: 'var(--dogo-primary)',
      confirmButtonText: 'Yes, Remove It',
      background: 'var(--dogo-cream)',
      customClass: { popup: 'rounded-[30px]' }
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.nairaAccounts.update(accounts => {
          const updated = accounts.filter(acc => acc.accountNumber !== accountNumber);
          localStorage.setItem('corporate_naira_accounts', JSON.stringify(updated));
          return updated;
        });
        this.checkSettlementLinkVerification();
        Swal.fire({
          icon: 'success',
          title: 'Removed!',
          text: 'The Naira bank account has been removed.',
          timer: 2000,
          showConfirmButton: false,
          background: 'var(--dogo-cream)',
          customClass: { popup: 'rounded-[30px]' }
        });
      }
    });
  }

  updateNairaField(field: string, value: any) {
    this.newNairaForm.set({ ...this.newNairaForm(), [field]: value });
  }

  // --- Domiciliary Bank Account Actions ---
  startAddDom() {
    this.newDomForm.set({
      bankId: 5,
      accountNumber: '',
      accountName: this.companyProfile().companyName + ' (USD)',
      correspondentBank: 'BANK OF AMERICA NEW YORK',
      sortCode: '',
      iban: '',
      swiftCode: 'FIRNNGLA',
      beneficiaryAccountName: '',
      beneficiaryAccountNo: '',
      beneficiaryAddress: '',
      forFurtherCredit: ''
    });
    this.isAddingDom.set(true);
  }

  cancelAddDom() {
    this.isAddingDom.set(false);
  }

  saveDom() {
    this.isSavingDom.set(true);
    setTimeout(() => {
      const selectedBank = this.availableBanks().find(b => b.bankId == this.newDomForm().bankId);
      const newAcc = {
        bankId: this.newDomForm().bankId,
        bankName: selectedBank ? selectedBank.bankName : 'Rand Merchant Bank',
        accountNumber: this.newDomForm().accountNumber,
        accountName: this.newDomForm().accountName,
        correspondentBank: this.newDomForm().correspondentBank,
        sortCode: this.newDomForm().sortCode,
        iban: this.newDomForm().iban,
        swiftCode: this.newDomForm().swiftCode,
        beneficiaryAccountName: this.newDomForm().beneficiaryAccountName,
        beneficiaryAccountNo: this.newDomForm().beneficiaryAccountNo,
        beneficiaryAddress: this.newDomForm().beneficiaryAddress,
        forFurtherCredit: this.newDomForm().forFurtherCredit,
        isDefault: false
      };
      this.domiciliaryAccounts.update(accounts => {
        const updated = [...accounts, newAcc];
        localStorage.setItem('corporate_dom_accounts', JSON.stringify(updated));
        return updated;
      });
      this.checkSettlementLinkVerification();
      this.isAddingDom.set(false);
      this.isSavingDom.set(false);

      Swal.fire({
        icon: 'success',
        title: 'Domiciliary Account Linked',
        text: 'International settlement account has been added successfully.',
        confirmButtonColor: 'var(--dogo-primary)',
        background: 'var(--dogo-cream)',
        customClass: { popup: 'rounded-[30px]' }
      });
    }, 1200);
  }

  deleteDom(accountNumber: string) {
    Swal.fire({
      title: 'Remove Domiciliary Account?',
      text: "You won't be able to withdraw corporate foreign currency reserves to this account.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: 'var(--dogo-primary)',
      confirmButtonText: 'Yes, Remove It',
      background: 'var(--dogo-cream)',
      customClass: { popup: 'rounded-[30px]' }
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.domiciliaryAccounts.update(accounts => {
          const updated = accounts.filter(acc => acc.accountNumber !== accountNumber);
          localStorage.setItem('corporate_dom_accounts', JSON.stringify(updated));
          return updated;
        });
        this.checkSettlementLinkVerification();
        Swal.fire({
          icon: 'success',
          title: 'Removed!',
          text: 'The Domiciliary account has been removed.',
          timer: 2000,
          showConfirmButton: false,
          background: 'var(--dogo-cream)',
          customClass: { popup: 'rounded-[30px]' }
        });
      }
    });
  }

  updateDomField(field: string, value: any) {
    this.newDomForm.set({ ...this.newDomForm(), [field]: value });
  }

  // --- Signatories & Directors Expanded Actions ---
  startAddSignatory() {
    this.newSignatoryForm.set({
      title: 'Mr',
      surname: '',
      firstName: '',
      otherNames: '',
      designation: 'Director / Signatory',
      dob: '',
      residentialAddress: '',
      email: '',
      phone: '',
      bvn: '',
      nationality: 'Nigerian',
      gender: 'Male',
      idType: 'Driver\'s License',
      idNumber: '',
      isPep: 'No',
      pepDetails: '',
      signingClass: 'A',
      passportPhoto: '',
      signatureImage: '',
      idDocument: ''
    });
    this.isAddingSignatory.set(true);
  }

  cancelAddSignatory() {
    this.isAddingSignatory.set(false);
  }

  saveSignatory() {
    this.isSavingSignatory.set(true);
    setTimeout(() => {
      const form = this.newSignatoryForm();
      const newSig = {
        ...form,
        status: 'active'
      };
      this.signatories.update(sigs => [...sigs, newSig]);
      this.isAddingSignatory.set(false);
      this.isSavingSignatory.set(false);

      Swal.fire({
        icon: 'success',
        title: 'Signatory Profile Linked',
        text: 'The authorized signatory has been registered successfully.',
        confirmButtonColor: 'var(--dogo-primary)',
        background: 'var(--dogo-cream)',
        customClass: { popup: 'rounded-[30px]' }
      });
    }, 1200);
  }

  removeSignatory(email: string) {
    Swal.fire({
      title: 'Remove Signatory?',
      text: 'This individual will lose authorization to execute corporate transactions.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: 'var(--dogo-primary)',
      confirmButtonText: 'Yes, Revoke Access',
      background: 'var(--dogo-cream)',
      customClass: { popup: 'rounded-[30px]' }
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.signatories.update(sigs => sigs.filter(s => s.email !== email));
        Swal.fire({
          icon: 'success',
          title: 'Access Revoked!',
          text: 'The signatory authorization has been removed.',
          timer: 2000,
          showConfirmButton: false,
          background: 'var(--dogo-cream)',
          customClass: { popup: 'rounded-[30px]' }
        });
      }
    });
  }

  updateSignatoryField(field: string, value: any) {
    this.newSignatoryForm.set({ ...this.newSignatoryForm(), [field]: value });
  }

  // --- Controlling Director Actions ---
  startAddDirector() {
    this.newDirectorForm.set({
      title: 'Mr',
      surname: '',
      firstName: '',
      otherNames: '',
      designation: 'Controlling Director',
      dob: '',
      residentialAddress: '',
      email: '',
      phone: '',
      bvn: '',
      nationality: 'Nigerian',
      gender: 'Male',
      idType: 'Driver\'s License',
      idNumber: '',
      isPep: 'No',
      pepDetails: '',
      signingClass: 'A',
      passportPhoto: '',
      signatureImage: '',
      idDocument: ''
    });
    this.isAddingDirector.set(true);
  }

  cancelAddDirector() {
    this.isAddingDirector.set(false);
  }

  saveDirector() {
    this.isSavingDirector.set(true);
    setTimeout(() => {
      const form = this.newDirectorForm();
      const newDir = {
        ...form,
        status: 'active'
      };
      this.directors.update(dirs => [...dirs, newDir]);
      this.isAddingDirector.set(false);
      this.isSavingDirector.set(false);

      Swal.fire({
        icon: 'success',
        title: 'Director Registered',
        text: 'The controlling director profile has been successfully saved.',
        confirmButtonColor: 'var(--dogo-primary)',
        background: 'var(--dogo-cream)',
        customClass: { popup: 'rounded-[30px]' }
      });
    }, 1200);
  }

  removeDirector(email: string) {
    Swal.fire({
      title: 'Remove Controlling Director?',
      text: 'This user will be removed from your active compliance directories.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: 'var(--dogo-primary)',
      confirmButtonText: 'Yes, Remove Profile',
      background: 'var(--dogo-cream)',
      customClass: { popup: 'rounded-[30px]' }
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.directors.update(dirs => dirs.filter(d => d.email !== email));
        Swal.fire({
          icon: 'success',
          title: 'Director Removed!',
          text: 'The controlling director profile has been removed.',
          timer: 2000,
          showConfirmButton: false,
          background: 'var(--dogo-cream)',
          customClass: { popup: 'rounded-[30px]' }
        });
      }
    });
  }

  updateDirectorField(field: string, value: any) {
    this.newDirectorForm.set({ ...this.newDirectorForm(), [field]: value });
  }

  // --- Photo & Document Upload Readers ---
  handlePassportUpload(event: any, isDirector: boolean) {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (isDirector) {
          this.newDirectorForm.set({ ...this.newDirectorForm(), passportPhoto: e.target.result });
        } else {
          this.newSignatoryForm.set({ ...this.newSignatoryForm(), passportPhoto: e.target.result });
        }
      };
      reader.readAsDataURL(file);
    }
  }

  handleSignatureUpload(event: any, isDirector: boolean) {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (isDirector) {
          this.newDirectorForm.set({ ...this.newDirectorForm(), signatureImage: e.target.result });
        } else {
          this.newSignatoryForm.set({ ...this.newSignatoryForm(), signatureImage: e.target.result });
        }
      };
      reader.readAsDataURL(file);
    }
  }

  handleIdUpload(event: any, isDirector: boolean) {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (isDirector) {
          this.newDirectorForm.set({ ...this.newDirectorForm(), idDocument: e.target.result });
        } else {
          this.newSignatoryForm.set({ ...this.newSignatoryForm(), idDocument: e.target.result });
        }
      };
      reader.readAsDataURL(file);
    }
  }

  // --- Full Profile View Modal Actions ---
  viewPerson(person: any) {
    this.selectedPerson.set(person);
  }

  closePersonModal() {
    this.selectedPerson.set(null);
  }

  // --- Security Actions ---
  toggleTwoFactor() {
    this.isUpdatingTwoFactor.set(true);
    setTimeout(() => {
      this.isTwoFactorEnabled.set(!this.isTwoFactorEnabled());
      this.isUpdatingTwoFactor.set(false);
    }, 800);
  }

  startEditPin() {
    this.pinForm.set({ oldPin: '', newPin: '', confirmPin: '' });
    this.pinError.set('');
    this.isEditingPin.set(true);
  }

  cancelEditPin() {
    this.isEditingPin.set(false);
  }

  updatePinField(field: 'oldPin' | 'newPin' | 'confirmPin', value: string) {
    this.pinForm.set({ ...this.pinForm(), [field]: value.replace(/[^0-9]/g, '') });
  }

  savePin() {
    const form = this.pinForm();
    if (this.hasPin() && !form.oldPin) {
      this.pinError.set('Current PIN is required');
      return;
    }
    if (form.newPin.length !== 6 || form.confirmPin.length !== 6) {
      this.pinError.set('PIN must be exactly 6 digits');
      return;
    }
    if (form.newPin !== form.confirmPin) {
      this.pinError.set('New and Confirm PIN do not match');
      return;
    }

    this.isUpdatingPin.set(true);
    this.pinError.set('');
    setTimeout(() => {
      this.hasPin.set(true);
      this.isEditingPin.set(false);
      this.isUpdatingPin.set(false);

      Swal.fire({
        icon: 'success',
        title: 'Corporate PIN Saved',
        text: 'The security transaction PIN has been updated.',
        timer: 2000,
        showConfirmButton: false,
        background: 'var(--dogo-cream)',
        customClass: { popup: 'rounded-[30px]' }
      });
    }, 1200);
  }

  checkSettlementLinkVerification() {
    if (typeof window === 'undefined') return;
    const nairaCount = this.nairaAccounts().length;
    const domCount = this.domiciliaryAccounts().length;
    const hasAccounts = nairaCount > 0 || domCount > 0;
    
    const vList = this.verifications();
    const item = vList.find(i => i.type === 'settlementLink');
    if (item) {
      const currentStatus = item.status;
      const expectedStatus = hasAccounts ? 'verified' : 'unverified';
      if (currentStatus !== expectedStatus) {
        const updated = vList.map(i =>
          i.type === 'settlementLink' ? { ...i, status: expectedStatus, date: hasAccounts ? new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A' } : i
        );
        this.verifications.set(updated);
        localStorage.setItem('corporate_verifications', JSON.stringify(updated));
      }
    }
  }
}
