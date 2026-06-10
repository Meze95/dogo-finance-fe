import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BadgeComponent } from '../../../shared/components/ui/badge.component';
import { ButtonComponent } from '../../../shared/components/ui/button.component';
import { CardComponent } from '../../../shared/components/ui/card.component';
import { DropdownComponent, DropdownOption } from '../../../shared/components/ui/dropdown.component';

import { CustomerService } from '../../../shared/services/customer.service';
import { BankService } from '../../../shared/services/bank.service';
import { AuthService } from '../../../shared/services/auth.service';

declare var Swal: any;

export type CorporateSettingsTab = 'profile' | 'verification' | 'banks' | 'signatories' | 'security';

@Component({
  selector: 'app-corporate-settings',
  standalone: true,
  imports: [CommonModule, BadgeComponent, ButtonComponent, CardComponent, FormsModule, DropdownComponent],
  templateUrl: './corporate-settings.component.html',
  styleUrl: './corporate-settings.component.css'
})
export class CorporateSettingsComponent implements OnInit {
  private customerService = inject(CustomerService);
  private bankService = inject(BankService);
  private authService = inject(AuthService);

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

  ngOnInit() {
    this.loadCorporateProfile();
    this.loadPrimaryContact();
    this.loadVerifications();
    this.loadAvailableBanks();
    this.loadBankAccounts();
    this.loadSignatories();
    this.loadDirectors();
  }

  loadSignatories() {
    this.customerService.getCorporateSignatories().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.signatories.set(res.data);
        }
      },
      error: (err) => console.error('Failed to load signatories', err)
    });
  }

  loadDirectors() {
    this.customerService.getCorporateDirectors().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.directors.set(res.data);
        }
      },
      error: (err) => console.error('Failed to load directors', err)
    });
  }

  loadAvailableBanks() {
    this.bankService.getBanks().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.availableBanks.set(res.data);
        }
      },
      error: (err) => console.error('Failed to load banks', err)
    });
  }

  loadBankAccounts() {
    this.bankService.getMyBanks().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const naira = res.data.filter((b: any) => !b.currencyCode || b.currencyCode === 'NGN');
          const dom = res.data.filter((b: any) => b.currencyCode && b.currencyCode !== 'NGN');
          this.nairaAccounts.set(naira);
          this.domiciliaryAccounts.set(dom);
        }
      },
      error: (err) => console.error('Failed to load user banks', err)
    });
  }

  loadVerifications() {
    this.customerService.getCorporateVerifications().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.verifications.set(res.data);
          localStorage.setItem('corporate_verifications', JSON.stringify(res.data));
        }
      },
      error: (err) => console.error('Failed to load verifications', err)
    });
  }

  loadPrimaryContact() {
    this.customerService.getPrimaryContact().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.primaryContact.set({
            fullName: res.data.fullName || '',
            email: res.data.email || '',
            phone: res.data.phone || ''
          });
        }
      },
      error: (err) => console.error('Failed to load primary contact', err)
    });
  }

  loadCorporateProfile() {
    this.customerService.getCorporateProfile().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.companyProfile.set({
            companyName: res.data.companyName || '',
            registrationNumber: res.data.registrationNumber || '',
            dateOfIncorporation: res.data.dateOfIncorporation ? res.data.dateOfIncorporation.substring(0, 10) : '',
            natureOfBusiness: res.data.natureOfBusiness || '',
            address: res.data.address || '',
            entityType: res.data.entityType || '',
            otherEntityType: res.data.otherEntityType || '',
            phone: res.data.phone || '',
            tin: res.data.tin || '',
            email: res.data.email || '',
            annualTurnover: res.data.annualTurnover || '',
            sourceOfFunds: res.data.sourceOfFunds || '',
            clientSegmentation: res.data.clientSegmentation || ''
          });
        }
      },
      error: (err) => console.error('Failed to load corporate profile', err)
    });
  }

  loadStateFromStorage() {
    if (typeof window === 'undefined') return;
    
    const storedVerif = localStorage.getItem('corporate_verifications');
    if (storedVerif) {
      this.verifications.set(JSON.parse(storedVerif));
    } else {
      localStorage.setItem('corporate_verifications', JSON.stringify(this.verifications()));
    }

    this.checkSettlementLinkVerification();
  }


  // --- Corporate Profile State (ZEDCREST Form Fields) ---
  isEditingProfile = signal(false);
  isUpdatingProfile = signal(false);
  showProfileErrors = signal(false);
  companyProfile = signal({
    companyName: '',
    registrationNumber: '',
    dateOfIncorporation: '',
    natureOfBusiness: '',
    address: '',
    entityType: '',
    otherEntityType: '',
    phone: '',
    tin: '',
    email: '',
    annualTurnover: '',
    sourceOfFunds: '',
    clientSegmentation: ''
  });
  editProfileForm = signal<any>({});

  // --- Primary Contact Person State (G. PRIMARY CONTACT PERSON) ---
  isEditingContact = signal(false);
  isUpdatingContact = signal(false);
  primaryContact = signal({
    fullName: '',
    email: '',
    phone: ''
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
    { name: '1. Completed Application Form', type: 'appForm', status: 'verified', icon: 'ri-file-list-3-line', date: 'May 20, 2026', requiresUpload: false },
    { name: '2. Certificate of Incorporation', type: 'incorporation', status: 'verified', icon: 'ri-verified-badge-line', date: 'May 20, 2026', requiresUpload: true },
    { name: '3. Passport Photography of each Authorized Signatory', type: 'passport', status: 'verified', icon: 'ri-user-line', date: 'May 21, 2026', requiresUpload: false },
    { name: '4. Memorandum & Articles of Association', type: 'memart', status: 'verified', icon: 'ri-book-read-line', date: 'May 20, 2026', requiresUpload: true },
    { name: '5. Form CAC 2 (Return of Allotment of Shares)', type: 'cac2', status: 'pending', icon: 'ri-pie-chart-line', date: 'May 26, 2026', requiresUpload: true },
    { name: '6. Form CAC 7 (Particulars of Directors)', type: 'cac7', status: 'pending', icon: 'ri-folder-user-line', date: 'May 26, 2026', requiresUpload: false },
    { name: '7. Form CAC 3 (Notice of Situation/Change of Registered Address)', type: 'cac3', status: 'unverified', icon: 'ri-map-pin-user-line', date: 'N/A', requiresUpload: true },
    { name: '8. Copy of Identification of Authorized Signatories and Directors', type: 'signatoryId', status: 'unverified', icon: 'ri-shield-user-line', date: 'N/A', requiresUpload: false },
    { name: '9. Board Resolution/minutes of meeting confirming Authorized Signatories', type: 'boardResolution', status: 'unverified', icon: 'ri-team-line', date: 'N/A', requiresUpload: true },
    { name: '10. Link Settlement Bank Account', type: 'settlementLink', status: 'unverified', icon: 'ri-bank-line', date: 'N/A', requiresUpload: false }
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

  availableBanks = signal<any[]>([]);

  isAddingNaira = signal(false);
  isSavingNaira = signal(false);
  newNairaForm = signal<any>({ bankId: '', accountNumber: '', accountName: '', bankBranch: '' });

  isAddingDom = signal(false);
  isSavingDom = signal(false);
  newDomForm = signal<any>({
    bankId: '',
    accountNumber: '',
    accountName: '',
    correspondentBank: '',
    sortCode: '',
    iban: '',
    swiftCode: '',
    beneficiaryAccountName: '',
    beneficiaryAccountNo: '',
    beneficiaryAddress: '',
    forFurtherCredit: ''
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

  signatories = signal<any[]>([]);

  directors = signal<any[]>([]);

  isAddingSignatory = signal(false);
  isSavingSignatory = signal(false);
  newSignatoryForm = signal<any>({
    title: 'Mr',
    surname: '',
    firstName: '',
    otherNames: '',
    designation: '',
    dateOfBirth: '',
    residentialAddress: '',
    email: '',
    phone: '',
    bvn: '',
    nationality: 'Nigerian',
    gender: 'Male',
    identityType: 'Driver\'s License',
    idNumber: '',
    isPep: 'No',
    pepDetails: '',
    signingClass: 'A',
    passportPhotoUrl: '',
    signatureCardUrl: '',
    identityDocumentUrl: ''
  });
  passportPhotoFile = signal<File | null>(null);
  signatureCardFile = signal<File | null>(null);
  idDocumentFile = signal<File | null>(null);

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
    businessEmail: '',
    phoneNumber: '',
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
  directorPassportPhotoFile = signal<File | null>(null);
  directorSignatureCardFile = signal<File | null>(null);
  directorIdDocumentFile = signal<File | null>(null);

  // --- Corporate Security State ---
  isTwoFactorEnabled = computed(() => {
    const user = this.authService.currentUser();
    return user?.is2faEnabled || user?.Is2faEnabled || false;
  });
  isUpdatingTwoFactor = signal(false);
  isEditingPin = signal(false);
  isUpdatingPin = signal(false);
  hasPin = computed(() => {
    const user = this.authService.currentUser();
    return user?.isPinSet || user?.IsPinSet || false;
  });
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
    this.showProfileErrors.set(false);
  }

  cancelEditProfile() {
    this.isEditingProfile.set(false);
    this.showProfileErrors.set(false);
  }

  saveProfile() {
    this.showProfileErrors.set(true);
    const form = this.editProfileForm();
    if (!form.companyName || !form.registrationNumber || !form.dateOfIncorporation || !form.natureOfBusiness || !form.address || !form.entityType || (form.entityType === 'Others' && !form.otherEntityType) || !form.phone || !form.tin || !form.email || !form.annualTurnover || !form.sourceOfFunds || !form.clientSegmentation) {
      Swal.fire('Validation Error', 'Please fill in all required fields.', 'error');
      return;
    }

    this.isUpdatingProfile.set(true);
    const updatedData = { ...this.companyProfile(), ...form };
    
    this.customerService.updateCorporateProfile(updatedData).subscribe({
      next: (res) => {
        if (res.success) {
          this.companyProfile.set(updatedData);
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
        } else {
          this.isUpdatingProfile.set(false);
          Swal.fire('Error', res.message || 'Failed to update profile', 'error');
        }
      },
      error: (err) => {
        this.isUpdatingProfile.set(false);
        Swal.fire('Error', 'An error occurred while updating profile', 'error');
      }
    });
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
    const updatedData = { ...this.primaryContact(), ...this.editContactForm() };

    this.customerService.updatePrimaryContact({
      fullName: updatedData.fullName,
      email: updatedData.email,
      phoneNumber: updatedData.phone
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.primaryContact.set(updatedData);
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
        } else {
          this.isUpdatingContact.set(false);
          Swal.fire('Error', res.message || 'Failed to update contact', 'error');
        }
      },
      error: (err) => {
        this.isUpdatingContact.set(false);
        Swal.fire('Error', 'An error occurred while updating contact', 'error');
      }
    });
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
    const active = this.activeVerification();
    const file = this.addressFile();
    
    if (!file) {
      Swal.fire('Error', 'Please select a file to upload.', 'error');
      return;
    }

    this.isVerifying.set(true);
    const formData = new FormData();
    formData.append('documentType', active.type);
    formData.append('file', file);

    this.customerService.uploadCorporateDocument(formData).subscribe({
      next: (res) => {
        this.isVerifying.set(false);
        if (res.success) {
          this.isVerificationSuccess.set(true);
          this.loadVerifications();
          setTimeout(() => this.closeVerificationModal(), 1500);
        } else {
          Swal.fire('Error', res.message || 'Failed to upload document', 'error');
        }
      },
      error: (err) => {
        this.isVerifying.set(false);
        Swal.fire('Error', 'An error occurred during upload', 'error');
      }
    });
  }

  // --- Naira Bank Account Actions ---
  startAddNaira() {
    this.newNairaForm.set({ 
      bankId: '', 
      accountNumber: '', 
      accountName: this.companyProfile()?.companyName || '', 
      bankBranch: '' 
    });
    this.isAddingNaira.set(true);
  }

  cancelAddNaira() {
    this.isAddingNaira.set(false);
  }

  saveNaira() {
    this.isSavingNaira.set(true);
    const form = this.newNairaForm();
    const payload = {
      bankId: form.bankId,
      accountNumber: form.accountNumber,
      accountName: form.accountName,
      currencyCode: 'NGN',
      isDefault: false
    };

    this.bankService.addBank(payload).subscribe({
      next: (res) => {
        this.isSavingNaira.set(false);
        if (res.success) {
          this.loadBankAccounts();
          this.checkSettlementLinkVerification();
          this.isAddingNaira.set(false);

          Swal.fire({
            icon: 'success',
            title: 'Naira Account Linked',
            text: 'Local Naira settlement account has been added successfully.',
            confirmButtonColor: 'var(--dogo-primary)',
            background: 'var(--dogo-cream)',
            customClass: { popup: 'rounded-[30px]' }
          });
        } else {
          Swal.fire('Error', res.message || 'Failed to add Naira account', 'error');
        }
      },
      error: (err) => {
        this.isSavingNaira.set(false);
        Swal.fire('Error', 'An error occurred while linking account.', 'error');
      }
    });
  }

  deleteNaira(customerBankId: string | number) {
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
        this.bankService.deleteBank(customerBankId).subscribe({
          next: (res) => {
            if (res.success) {
              this.loadBankAccounts();
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
            } else {
              Swal.fire('Error', res.message || 'Failed to remove account', 'error');
            }
          },
          error: (err) => Swal.fire('Error', 'An error occurred.', 'error')
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
      bankId: '',
      accountNumber: '',
      accountName: this.companyProfile()?.companyName || '',
      correspondentBank: '',
      sortCode: '',
      iban: '',
      swiftCode: '',
      beneficiaryAccountName: this.companyProfile()?.companyName || '',
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
    const form = this.newDomForm();
    const payload = {
      bankId: form.bankId,
      accountNumber: form.accountNumber,
      accountName: form.accountName,
      currencyCode: 'USD', // For now hardcoded or fetched from form
      correspondentBank: form.correspondentBank,
      sortCode: form.sortCode,
      iban: form.iban,
      swiftCode: form.swiftCode,
      beneficiaryAccountName: form.beneficiaryAccountName,
      beneficiaryAccountNumber: form.beneficiaryAccountNo,
      beneficiaryAddress: form.beneficiaryAddress,
      ffcDetails: form.forFurtherCredit,
      isDefault: false
    };

    this.bankService.addBank(payload).subscribe({
      next: (res) => {
        this.isSavingDom.set(false);
        if (res.success) {
          this.loadBankAccounts();
          this.checkSettlementLinkVerification();
          this.isAddingDom.set(false);

          Swal.fire({
            icon: 'success',
            title: 'Domiciliary Account Linked',
            text: 'International settlement account has been added successfully.',
            confirmButtonColor: 'var(--dogo-primary)',
            background: 'var(--dogo-cream)',
            customClass: { popup: 'rounded-[30px]' }
          });
        } else {
          Swal.fire('Error', res.message || 'Failed to add account', 'error');
        }
      },
      error: (err) => {
        this.isSavingDom.set(false);
        Swal.fire('Error', 'An error occurred while linking account.', 'error');
      }
    });
  }

  deleteDom(customerBankId: string | number) {
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
        this.bankService.deleteBank(customerBankId).subscribe({
          next: (res) => {
            if (res.success) {
              this.loadBankAccounts();
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
            } else {
              Swal.fire('Error', res.message || 'Failed to remove account', 'error');
            }
          },
          error: (err) => Swal.fire('Error', 'An error occurred.', 'error')
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
      title: '',
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
      signingClass: 'Class A',
      passportPhoto: '',
      signatureImage: '',
      idDocument: ''
    });
    this.passportPhotoFile.set(null);
    this.signatureCardFile.set(null);
    this.idDocumentFile.set(null);
    this.isAddingSignatory.set(true);
  }

  cancelAddSignatory() {
    this.isAddingSignatory.set(false);
  }

  saveSignatory() {
    this.isSavingSignatory.set(true);
    const form = this.newSignatoryForm();

    if (!this.passportPhotoFile() || !this.signatureCardFile() || !this.idDocumentFile()) {
      Swal.fire('Missing Files', 'Please upload Passport, Signature Card, and ID Document.', 'error');
      this.isSavingSignatory.set(false);
      return;
    }

    const formData = new FormData();
    formData.append('Title', form.title || 'Mr');
    formData.append('Surname', form.surname);
    formData.append('FirstName', form.firstName);
    formData.append('OtherNames', form.otherNames || '');
    formData.append('Designation', form.designation);
    formData.append('DateOfBirth', form.dob);
    formData.append('ResidentialAddress', form.residentialAddress);
    formData.append('BusinessEmail', form.email);
    formData.append('PhoneNumber', form.phone);
    formData.append('Bvn', form.bvn);
    formData.append('Nationality', form.nationality);
    formData.append('Gender', form.gender);
    formData.append('SigningClass', form.signingClass);
    formData.append('IdentityType', form.idType);
    formData.append('IdNumber', form.idNumber);
    formData.append('IsPep', form.isPep === 'Yes' ? 'true' : 'false');
    
    formData.append('PassportPhoto', this.passportPhotoFile() as Blob);
    formData.append('SignatureCard', this.signatureCardFile() as Blob);
    formData.append('IdentityDocument', this.idDocumentFile() as Blob);

    this.customerService.addCorporateSignatory(formData).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadSignatories();
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
        } else {
          Swal.fire('Error', res.message || 'Failed to add signatory', 'error');
          this.isSavingSignatory.set(false);
        }
      },
      error: (err) => {
        Swal.fire('Error', 'An unexpected error occurred.', 'error');
        this.isSavingSignatory.set(false);
      }
    });
  }

  removeSignatory(signatoryId: number) {
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
        this.customerService.deleteCorporateSignatory(signatoryId).subscribe({
          next: (res) => {
            if (res.success) {
              this.loadSignatories();
              Swal.fire({
                icon: 'success',
                title: 'Access Revoked!',
                text: 'The signatory authorization has been removed.',
                timer: 2000,
                showConfirmButton: false,
                background: 'var(--dogo-cream)',
                customClass: { popup: 'rounded-[30px]' }
              });
            } else {
              Swal.fire('Error', res.message || 'Failed to remove signatory', 'error');
            }
          },
          error: (err) => Swal.fire('Error', 'Failed to remove signatory.', 'error')
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
      businessEmail: '',
      phoneNumber: '',
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
    this.directorPassportPhotoFile.set(null);
    this.directorSignatureCardFile.set(null);
    this.directorIdDocumentFile.set(null);
    this.isAddingDirector.set(true);
  }

  cancelAddDirector() {
    this.isAddingDirector.set(false);
  }

  saveDirector() {
    this.isSavingDirector.set(true);

    const form = this.newDirectorForm();
    const formData = new FormData();
    
    // Map existing form properties
    formData.append('title', form.title);
    formData.append('surname', form.surname);
    formData.append('firstName', form.firstName);
    if (form.otherNames) formData.append('otherNames', form.otherNames);
    formData.append('designation', form.designation);
    formData.append('dateOfBirth', form.dateOfBirth);
    formData.append('residentialAddress', form.residentialAddress);
    formData.append('businessEmail', form.businessEmail);
    formData.append('phoneNumber', form.phoneNumber);
    formData.append('bvn', form.bvn);
    formData.append('nationality', form.nationality);
    formData.append('gender', form.gender);
    formData.append('signingClass', form.signingClass);
    formData.append('identityType', form.identityType);
    formData.append('idNumber', form.idNumber);
    formData.append('isPep', form.isPep ? 'true' : 'false');

    // Append raw File objects for Cloudinary
    const passportFile = this.directorPassportPhotoFile();
    const signatureFile = this.directorSignatureCardFile();
    const idDocFile = this.directorIdDocumentFile();

    if (!passportFile || !signatureFile || !idDocFile) {
      Swal.fire('Error', 'Please upload Passport, Signature, and ID Document.', 'error');
      this.isSavingDirector.set(false);
      return;
    }

    formData.append('passportPhoto', passportFile);
    formData.append('signatureCard', signatureFile);
    formData.append('identityDocument', idDocFile);

    this.customerService.addCorporateDirector(formData).subscribe({
      next: (res) => {
        if (res.success) {
          Swal.fire({
            icon: 'success',
            title: 'Director Registered',
            text: 'The controlling director profile has been successfully saved.',
            timer: 2000,
            showConfirmButton: false,
            confirmButtonColor: 'var(--dogo-primary)',
            background: 'var(--dogo-cream)',
            customClass: { popup: 'rounded-[30px]' }
          });
          this.loadDirectors();
          this.isAddingDirector.set(false);
        } else {
          Swal.fire('Error', res.message || 'Failed to add director', 'error');
        }
        this.isSavingDirector.set(false);
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'An error occurred while adding director', 'error');
        this.isSavingDirector.set(false);
      }
    });
  }

  removeDirector(id: number) {
    Swal.fire({
      icon: 'warning',
      title: 'Remove Controlling Director?',
      text: 'This user will be removed from your active compliance directories.',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove',
      confirmButtonColor: '#ef4444',
      cancelButtonText: 'Cancel'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.customerService.deleteCorporateDirector(id).subscribe({
          next: (res) => {
            if (res.success) {
              Swal.fire('Director Removed!', 'The controlling director profile has been removed.', 'success');
              this.loadDirectors();
            } else {
              Swal.fire('Error', res.message || 'Failed to remove director', 'error');
            }
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'An error occurred', 'error');
          }
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
      if (!isDirector) {
        this.passportPhotoFile.set(file);
      } else {
        this.directorPassportPhotoFile.set(file);
      }
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (isDirector) {
          this.newDirectorForm.set({ ...this.newDirectorForm(), passportPhotoUrl: e.target.result });
        } else {
          this.newSignatoryForm.set({ ...this.newSignatoryForm(), passportPhotoUrl: e.target.result });
        }
      };
      reader.readAsDataURL(file);
    }
  }

  handleSignatureUpload(event: any, isDirector: boolean) {
    const file = event.target.files?.[0];
    if (file) {
      if (!isDirector) {
        this.signatureCardFile.set(file);
      } else {
        this.directorSignatureCardFile.set(file);
      }
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (isDirector) {
          this.newDirectorForm.set({ ...this.newDirectorForm(), signatureCardUrl: e.target.result });
        } else {
          this.newSignatoryForm.set({ ...this.newSignatoryForm(), signatureCardUrl: e.target.result });
        }
      };
      reader.readAsDataURL(file);
    }
  }

  handleIdUpload(event: any, isDirector: boolean) {
    const file = event.target.files?.[0];
    if (file) {
      if (!isDirector) {
        this.idDocumentFile.set(file);
      } else {
        this.directorIdDocumentFile.set(file);
      }
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (isDirector) {
          this.newDirectorForm.set({ ...this.newDirectorForm(), identityDocumentUrl: e.target.result });
        } else {
          this.newSignatoryForm.set({ ...this.newSignatoryForm(), identityDocumentUrl: e.target.result });
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
    const newState = !this.isTwoFactorEnabled();
    this.authService.toggle2fa(newState).subscribe({
      next: () => {
        const user = this.authService.currentUser();
        this.authService.setCurrentUser({ ...user, is2faEnabled: newState, Is2faEnabled: newState });
        this.isUpdatingTwoFactor.set(false);
      },
      error: () => this.isUpdatingTwoFactor.set(false)
    });
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
    
    const request = this.hasPin() 
      ? this.authService.changePin({ oldPin: form.oldPin, newPin: form.newPin })
      : this.authService.setupPin({ pin: form.newPin, confirmPin: form.confirmPin });

    request.subscribe({
      next: (res: any) => {
        const currentUser = this.authService.currentUser();
        this.authService.setCurrentUser({ ...currentUser, isPinSet: true, IsPinSet: true });
        
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
      },
      error: (err: any) => {
        this.isUpdatingPin.set(false);
        this.pinError.set(err.error?.message || 'Failed to update PIN');
        Swal.fire({
          icon: 'error',
          title: 'PIN Update Failed',
          text: err.error?.message || 'Could not change your security PIN.',
          confirmButtonColor: 'var(--dogo-primary)',
          background: 'var(--dogo-cream)',
          customClass: { popup: 'rounded-[30px]' }
        });
      }
    });
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
