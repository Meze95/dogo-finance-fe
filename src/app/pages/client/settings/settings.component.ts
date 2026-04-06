import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService, UserProfile, NextOfKin, BankAccount, Bank } from './settings.service';
import { BadgeComponent } from '../../../shared/components/ui/badge.component';
import { ButtonComponent } from '../../../shared/components/ui/button.component';
import { CardComponent } from '../../../shared/components/ui/card.component';
import { FormsModule } from '@angular/forms';

export type SettingsTab = 'profile' | 'verification' | 'banks' | 'wealth' | 'security';

@Component({
  selector: 'app-client-settings',
  standalone: true,
  imports: [CommonModule, BadgeComponent, ButtonComponent, CardComponent, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  private settingsService = inject(SettingsService);

  activeTab = signal<SettingsTab>('profile');
  
  // --- Profile State ---
  isEditingProfile = signal(false);
  isUpdatingProfile = signal(false);
  isUpdatingAvatar = signal(false);
  userProfile = signal<UserProfile>({
    firstName: 'Ado',
    lastName: 'Bayero',
    email: 'ado.bayero@example.com',
    phone: '+234 801 234 5678',
    avatar: 'AB',
    tier: 'Tier 2 Investor'
  });
  editProfileForm = signal<Partial<UserProfile>>({});
  profileImage = signal<string | null>(null);

  // --- Verifications State ---
  verifications = signal([
    { type: 'BVN', label: 'BVN Verification', status: 'pending', icon: 'ri-bank-card-line' },
    { type: 'NIN', label: 'NIN Verification', status: 'pending', icon: 'ri-shield-user-line' }
  ]);
  
  showVerificationModal = signal(false);
  activeVerification = signal<any>(null);
  verificationInput = signal('');
  isVerifying = signal(false);
  isVerificationSuccess = signal(false);

  // --- Bank Accounts State ---
  bankAccounts = signal<BankAccount[]>([]);
  availableBanks = signal<Bank[]>([]);
  bankSearchQuery = signal('');
  isAddingBank = signal(false);
  isSavingBank = signal(false);
  newBankForm = signal<Partial<BankAccount>>({ bankId: 0, accountNumber: '', accountName: '' });
  showBankPicker = signal(false);

  filteredBanks = () => {
    const query = this.bankSearchQuery().toLowerCase();
    return this.availableBanks().filter(b => b.bankName.toLowerCase().includes(query));
  };

  selectedBank = () => this.availableBanks().find(b => b.bankId === this.newBankForm().bankId);

  constructor() {
    this.loadBanks();
    this.loadMyBanks();
    this.loadNextOfKin();
  }

  loadNextOfKin() {
    this.settingsService.getNextOfKin().subscribe(res => {
      if (res.data) this.nextOfKin.set(res.data);
    });
  }

  loadBanks() {
    this.settingsService.getBanks().subscribe(res => {
      if (res.data) this.availableBanks.set(res.data);
    });
  }

  loadMyBanks() {
    this.settingsService.getMyBanks().subscribe(res => {
      if (res.data) this.bankAccounts.set(res.data);
    });
  }

  loadRelationshipTypes() {
    this.settingsService.getRelationshipTypes().subscribe(res => {
      if (res.data) this.relationships.set(res.data);
    });
  }

  // --- Wealth Legacy State (Next of Kin) ---
  isEditingKin = signal(false);
  isUpdatingKin = signal(false);
  nextOfKin = signal<NextOfKin | null>(null);
  editKinForm = signal<Partial<NextOfKin>>({});
  relationships = signal<string[]>([]);
  showRelationshipPicker = signal(false);

  // --- Security State ---
  isTwoFactorEnabled = signal(false);
  isUpdatingTwoFactor = signal(false);


  isEditingPin = signal(false);
  isUpdatingPin = signal(false);
  hasPin = signal(true); 
  pinForm = signal({ oldPin: '', newPin: '', confirmPin: '' });
  pinError = signal('');

  setTab(tab: SettingsTab) {
    this.activeTab.set(tab);
  }

  getBadgeVariant(status: string): any {
    switch (status) {
      case 'verified': return 'success';
      case 'pending': return 'warning';
      default: return 'info';
    }
  }

  // --- Profile Actions ---
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64 = e.target.result;
        this.isUpdatingAvatar.set(true);
        this.settingsService.updateProfilePicture(base64).subscribe({
          next: () => {
            this.profileImage.set(base64);
            this.isUpdatingAvatar.set(false);
          },
          error: () => this.isUpdatingAvatar.set(false)
        });
      };
      reader.readAsDataURL(file);
    }
  }

  startEditProfile() {
    this.editProfileForm.set({ ...this.userProfile() });
    this.isEditingProfile.set(true);
  }

  cancelEditProfile() {
    this.isEditingProfile.set(false);
  }

  saveProfile() {
    this.isUpdatingProfile.set(true);
    // Exclude email from update object to enforce rule
    const { email, ...updatePayload } = this.editProfileForm() as any;
    
    this.settingsService.updateProfile(updatePayload).subscribe({
      next: (res) => {
        if(res.data) {
          this.userProfile.set({ ...this.userProfile(), ...res.data });
        }
        this.isEditingProfile.set(false);
        this.isUpdatingProfile.set(false);
      },
      error: () => this.isUpdatingProfile.set(false)
    });
  }

  updateProfileField(field: keyof UserProfile, value: string) {
    this.editProfileForm.set({ ...this.editProfileForm(), [field]: value });
  }

  // --- Verification Actions ---
  openVerificationModal(v: any) {
    if (v.status === 'verified') return;
    this.activeVerification.set(v);
    this.verificationInput.set('');
    this.isVerificationSuccess.set(false);
    this.showVerificationModal.set(true);
  }

  closeVerificationModal() {
    this.showVerificationModal.set(false);
    this.activeVerification.set(null);
  }

  verifyDocument() {
    const doc = this.activeVerification();
    if (!doc || this.verificationInput().length !== 11) return;

    this.isVerifying.set(true);
    this.settingsService.verifyIdentityDocument(doc.type as 'BVN' | 'NIN', this.verificationInput()).subscribe({
      next: () => {
        this.isVerifying.set(false);
        this.isVerificationSuccess.set(true);
        
        // Update local array to mark as verified
        const updated = this.verifications().map(item => 
          item.type === doc.type ? { ...item, status: 'verified' } : item
        );
        this.verifications.set(updated);

        setTimeout(() => this.closeVerificationModal(), 2000);
      },
      error: () => this.isVerifying.set(false)
    });
  }

  // --- Bank Actions ---
  startAddBank() {
    this.newBankForm.set({ bankId: 0, accountNumber: '', accountName: this.userProfile().firstName + ' ' + this.userProfile().lastName });
    this.bankSearchQuery.set('');
    this.showBankPicker.set(false);
    this.isAddingBank.set(true);
  }

  cancelAddBank() {
    this.isAddingBank.set(false);
  }

  selectBank(bank: Bank) {
    this.newBankForm.set({ ...this.newBankForm(), bankId: bank.bankId });
    this.showBankPicker.set(false);
  }

  saveBank() {
    this.isSavingBank.set(true);
    const bank = this.newBankForm();

    this.settingsService.addBankAccount(bank).subscribe({
      next: (res) => {
        this.loadMyBanks();
        this.isAddingBank.set(false);
        this.isSavingBank.set(false);
      },
      error: () => this.isSavingBank.set(false)
    });
  }

  deleteBank(id: number) {
    this.settingsService.deleteBankAccount(id).subscribe(() => {
      this.loadMyBanks();
    });
  }

  setDefaultBank(id: number) {
    this.settingsService.setDefaultBank(id).subscribe(() => {
      this.loadMyBanks();
    });
  }

  updateBankField(field: keyof BankAccount, value: any) {
    if (field === 'bankId') value = parseInt(value);
    this.newBankForm.set({ ...this.newBankForm(), [field]: value });
  }

  // --- Kin Actions ---
  startEditKin() {
    if (this.nextOfKin()) {
      this.editKinForm.set({ ...this.nextOfKin() });
    } else {
      this.editKinForm.set({ fullName: '', relationship: 'Brother', email: '', phone: '' });
    }
    this.isEditingKin.set(true);
  }

  cancelEditKin() {
    this.isEditingKin.set(false);
    this.showRelationshipPicker.set(false);
  }

  saveKin() {
    this.isUpdatingKin.set(true);
    const kinData = this.editKinForm() as NextOfKin;
    
    const requestArgs = this.nextOfKin() 
      ? this.settingsService.updateNextOfKin(kinData)
      : this.settingsService.addNextOfKin(kinData);

    requestArgs.subscribe({
      next: (res) => {
        if(res.data) {
          this.nextOfKin.set(res.data);
        }
        this.isEditingKin.set(false);
        this.isUpdatingKin.set(false);
      },
      error: () => this.isUpdatingKin.set(false)
    });
  }

  updateKinField(field: keyof NextOfKin, value: string) {
    this.editKinForm.set({ ...this.editKinForm(), [field]: value });
  }

  // --- Security Actions ---
  toggleTwoFactor() {
    this.isUpdatingTwoFactor.set(true);
    const newState = !this.isTwoFactorEnabled();
    this.settingsService.updateTwoFactorAuth(newState).subscribe({
      next: () => {
        this.isTwoFactorEnabled.set(newState);
        this.isUpdatingTwoFactor.set(false);
      },
      error: () => this.isUpdatingTwoFactor.set(false)
    });
  }


  // Transaction PIN
  startEditPin() {
    this.pinForm.set({ oldPin: '', newPin: '', confirmPin: '' });
    this.pinError.set('');
    this.isEditingPin.set(true);
  }
  cancelEditPin() {
    this.isEditingPin.set(false);
    this.pinError.set('');
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
    this.settingsService.updateTransactionPin({
      oldPin: this.hasPin() ? form.oldPin : undefined,
      newPin: form.newPin
    }).subscribe({
      next: () => {
        this.hasPin.set(true);
        this.isEditingPin.set(false);
        this.isUpdatingPin.set(false);
      },
      error: () => this.isUpdatingPin.set(false)
    });
  }
}
