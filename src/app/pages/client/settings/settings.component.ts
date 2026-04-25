import { Component, signal, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService, UserProfile, NextOfKin, BankAccount, Bank } from './settings.service';
import { AuthService } from '../../../shared/services/auth.service';
import { BadgeComponent } from '../../../shared/components/ui/badge.component';
import { ButtonComponent } from '../../../shared/components/ui/button.component';
import { CardComponent } from '../../../shared/components/ui/card.component';
import { FormsModule } from '@angular/forms';
import { DropdownComponent, DropdownOption } from '../../../shared/components/ui/dropdown.component';

declare var Swal: any;

export type SettingsTab = 'profile' | 'verification' | 'banks' | 'wealth' | 'security';

@Component({
  selector: 'app-client-settings',
  standalone: true,
  imports: [CommonModule, BadgeComponent, ButtonComponent, CardComponent, FormsModule, DropdownComponent],
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
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatar: '',
    tier: ''
  });
  editProfileForm = signal<Partial<UserProfile>>({});
  profileImage = signal<string | null>(null);

  // --- Verifications State ---
  verifications = signal<any[]>([]);
  
  showVerificationModal = signal(false);
  activeVerification = signal<any>(null);
  verificationInput = signal('');
  isVerifying = signal(false);
  isVerificationSuccess = signal(false);

  // Address Specific
  addressDocType = signal('');
  addressFile = signal<File | null>(null);
  addressFilePreview = signal<string | null>(null);
  isUploadingAddressDoc = signal(false);

  addressDocTypes = signal<any[]>([]);
  addressDocOptions = computed<DropdownOption[]>(() => {
    return this.addressDocTypes().map(type => ({
      label: type.name,
      value: type.id, // Using the ID from the database
      icon: this.getDocIcon(type.name)
    }));
  });

  private getDocIcon(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('electricity')) return 'ri-flashlight-line';
    if (n.includes('water')) return 'ri-drop-line';
    if (n.includes('waste')) return 'ri-delete-bin-line';
    if (n.includes('bank')) return 'ri-bank-line';
    if (n.includes('tenancy')) return 'ri-home-4-line';
    return 'ri-file-list-3-line';
  }

  // --- Bank Accounts State ---
  bankAccounts = signal<BankAccount[]>([]);
  availableBanks = signal<Bank[]>([]);
  isAddingBank = signal(false);
  isSavingBank = signal(false);
  newBankForm = signal<Partial<BankAccount>>({ bankId: 0, accountNumber: '', accountName: '' });

  bankOptions = computed<DropdownOption[]>(() => 
    this.availableBanks().map(b => ({
      value: b.bankId,
      label: b.bankName,
      icon: 'ri-bank-line',
      subtitle: b.bankCode
    }))
  );

  private authService = inject(AuthService);

  constructor() {
    // Wait for user to be available before loading settings
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.loadProfile();
        this.loadBanks();
        this.loadMyBanks();
        this.loadNextOfKin();
        this.loadRelationshipTypes();
        this.loadAddressDocTypes();
        this.loadVerifications();
      }
    });
  }

  loadProfile() {
    this.settingsService.getProfile().subscribe(res => {
      if (res.data) {
        this.userProfile.set(res.data);
      }
    });
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

  loadAddressDocTypes() {
    this.settingsService.getAddressDocTypes().subscribe(res => {
      if (res.data) this.addressDocTypes.set(res.data);
    });
  }

  loadVerifications() {
    this.settingsService.getVerificationStatuses().subscribe(res => {
      if (res.data) this.verifications.set(res.data);
    });
  }

  // --- Wealth Legacy State (Next of Kin) ---
  isEditingKin = signal(false);
  isUpdatingKin = signal(false);
  nextOfKin = signal<NextOfKin | null>(null);
  editKinForm = signal<Partial<NextOfKin>>({});
  relationships = signal<any[]>([]);
  
  relationshipOptions = computed<DropdownOption[]>(() => {
    return this.relationships().map(r => ({
      value: r.id,
      label: r.name,
      icon: 'ri-heart-line'
    }));
  });

  // --- Security State ---
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

  setTab(tab: SettingsTab) {
    this.activeTab.set(tab);
  }

  getBadgeVariant(status: string): any {
    switch (status) {
      case 'verified': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'danger';
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

        Swal.fire({
          icon: 'success',
          title: 'Profile Updated',
          text: 'Your personal information has been saved.',
          timer: 2000,
          showConfirmButton: false,
          background: '#f8f7f2',
          customClass: { popup: 'rounded-[30px]' }
        });
      },
      error: (err: any) => {
        this.isUpdatingProfile.set(false);
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: err.error?.message || 'We could not update your profile.',
          confirmButtonColor: '#1B4332',
          background: '#f8f7f2',
          customClass: { popup: 'rounded-[30px]' }
        });
      }
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
    if (!doc) return;

    if (doc.type === 'Address') {
      if (!this.addressDocType() || !this.addressFile()) return;
      this.isVerifying.set(true);
      
      const formData = new FormData();
      formData.append('DocTypeId', this.addressDocType()); // This is the ID from the dropdown
      formData.append('File', this.addressFile()!);

      this.settingsService.verifyAddress(formData).subscribe({
        next: (res) => {
          this.isVerifying.set(false);
          this.isVerificationSuccess.set(true);
          this.loadVerifications();
          
          setTimeout(() => this.closeVerificationModal(), 2000);
        },
        error: (err) => {
          this.isVerifying.set(false);
          Swal.fire({
            icon: 'error',
            title: 'Upload Failed',
            text: err.error?.message || 'We could not process your document.',
            confirmButtonColor: '#1B4332',
            background: '#f8f7f2',
            customClass: { popup: 'rounded-[30px]' }
          });
        }
      });
      return;
    }

    if (this.verificationInput().length !== 11) return;

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

  onAddressFileSelected(event: any) {
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

  removeAddressFile() {
    this.addressFile.set(null);
    this.addressFilePreview.set(null);
  }

  // --- Bank Actions ---
  startAddBank() {
    this.newBankForm.set({ bankId: 0, accountNumber: '', accountName: this.userProfile().firstName + ' ' + this.userProfile().lastName });
    this.isAddingBank.set(true);
  }

  cancelAddBank() {
    this.isAddingBank.set(false);
  }

  saveBank() {
    this.isSavingBank.set(true);
    const bank = this.newBankForm();

    this.settingsService.addBankAccount(bank).subscribe({
      next: (res) => {
        this.loadMyBanks();
        this.isAddingBank.set(false);
        this.isSavingBank.set(false);

        Swal.fire({
          icon: 'success',
          title: 'Account Added',
          text: 'Your bank account has been successfully registered.',
          confirmButtonColor: '#1B4332',
          background: '#f8f7f2',
          customClass: { popup: 'rounded-[30px]' }
        });
      },
      error: (err: any) => {
        this.isSavingBank.set(false);
        Swal.fire({
          icon: 'error',
          title: 'Failed to Add Bank',
          text: err.error?.message || 'We could not link your bank account at this time.',
          confirmButtonColor: '#1B4332',
          background: '#f8f7f2',
          customClass: { popup: 'rounded-[30px]' }
        });
      }
    });
  }

  deleteBank(id: number) {
    Swal.fire({
      title: 'Remove Bank Account?',
      text: "You won't be able to withdraw to this account until you re-link it.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#1B4332',
      confirmButtonText: 'Yes, Remove It',
      background: '#f8f7f2',
      customClass: { popup: 'rounded-[30px]' }
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.settingsService.deleteBankAccount(id).subscribe({
          next: () => {
            this.loadMyBanks();
            Swal.fire({
              icon: 'success',
              title: 'Removed!',
              text: 'The bank account has been removed.',
              timer: 2000,
              showConfirmButton: false,
              background: '#f8f7f2',
              customClass: { popup: 'rounded-[30px]' }
            });
          },
          error: () => {
             Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Could not remove the bank account.',
              confirmButtonColor: '#1B4332',
              background: '#f8f7f2',
              customClass: { popup: 'rounded-[30px]' }
            });
          }
        });
      }
    });
  }

  setDefaultBank(id: number) {
    this.settingsService.setDefaultBank(id).subscribe({
      next: () => {
        this.loadMyBanks();
        Swal.fire({
          icon: 'success',
          title: 'Default Set',
          text: 'This account will now be used for withdrawals.',
          timer: 2000,
          showConfirmButton: false,
          background: '#f8f7f2',
          customClass: { popup: 'rounded-[30px]' }
        });
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Could not set default bank.',
          confirmButtonColor: '#1B4332',
          background: '#f8f7f2',
          customClass: { popup: 'rounded-[30px]' }
        });
      }
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
      // Find a default relationship ID if available
      const defaultRel = this.relationships().find(r => r.name === 'Brother' || r.name === 'Other') || this.relationships()[0];
      this.editKinForm.set({ 
        fullName: '', 
        relationship: defaultRel?.name || 'Brother', 
        relationshipId: defaultRel?.id || 1,
        email: '', 
        phone: '' 
      });
    }
    this.isEditingKin.set(true);
  }

  cancelEditKin() {
    this.isEditingKin.set(false);
  }

  saveKin() {
    // ... logic remains same, uses updated payload mapping in service
    this.isUpdatingKin.set(true);
    const kinData = this.editKinForm() as NextOfKin;
    
    const requestArgs = this.nextOfKin() 
      ? this.settingsService.updateNextOfKin(kinData)
      : this.settingsService.addNextOfKin(kinData);

    requestArgs.subscribe({
      next: (res) => {
        this.loadNextOfKin(); // Reload to get fresh data with mappings
        this.isEditingKin.set(false);
        this.isUpdatingKin.set(false);

        Swal.fire({
          icon: 'success',
          title: 'Security Contact Saved',
          text: 'Your Next of Kin details have been updated.',
          timer: 2000,
          showConfirmButton: false,
          background: '#f8f7f2',
          customClass: { popup: 'rounded-[30px]' }
        });
      },
      error: (err: any) => {
        this.isUpdatingKin.set(false);
        Swal.fire({
          icon: 'error',
          title: 'Action Failed',
          text: err.error?.message || 'Could not save Next of Kin details.',
          confirmButtonColor: '#1B4332',
          background: '#f8f7f2',
          customClass: { popup: 'rounded-[30px]' }
        });
      }
    });
  }

  updateKinField(field: keyof NextOfKin, value: any) {
    if (field === 'relationship') {
      // If relationship is being set, we are likely getting the ID from the dropdown
      const relId = parseInt(value);
      const rel = this.relationships().find(r => r.id === relId);
      this.editKinForm.set({ 
        ...this.editKinForm(), 
        relationshipId: relId,
        relationship: rel?.name || ''
      });
    } else {
      this.editKinForm.set({ ...this.editKinForm(), [field]: value });
    }
  }

  // --- Security Actions ---
  toggleTwoFactor() {
    this.isUpdatingTwoFactor.set(true);
    const newState = !this.isTwoFactorEnabled();
    this.settingsService.updateTwoFactorAuth(newState).subscribe({
      next: () => {
        // Update user session
        const user = this.authService.currentUser();
        this.authService.setCurrentUser({ ...user, is2faEnabled: newState, Is2faEnabled: newState });
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
    
    const request = this.hasPin() 
      ? this.settingsService.updateTransactionPin({ oldPin: form.oldPin, newPin: form.newPin })
      : this.settingsService.setupTransactionPin({ pin: form.newPin, confirmPin: form.confirmPin });

    request.subscribe({
      next: (res: any) => {
        // Update the user session in place to reflect PIN is now set
        const currentUser = this.authService.currentUser();
        this.authService.setCurrentUser({ ...currentUser, isPinSet: true, IsPinSet: true });
        
        this.isEditingPin.set(false);
        this.isUpdatingPin.set(false);
        
        Swal.fire({
          icon: 'success',
          title: 'PIN Updated',
          text: 'Your security PIN has been changed successfully.',
          timer: 2000,
          showConfirmButton: false,
          background: '#f8f7f2',
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
          confirmButtonColor: '#1B4332',
          background: '#f8f7f2',
          customClass: { popup: 'rounded-[30px]' }
        });
      }
    });
  }
}
