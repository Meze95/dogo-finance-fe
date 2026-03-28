import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  userProfile = signal({
    firstName: 'Martina',
    lastName: 'Adamu',
    email: 'm.adamu@dogofinance.com',
    phone: '08012345678',
    role: 'Super Admin',
  });

  is2FAEnabled = signal(false);

  passwordForm = signal({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  isProcessing2FA = signal(false);
  isProcessingPassword = signal(false);

  successMessage = signal<string | null>(null);
  passwordError = signal<string | null>(null);

  toggle2FA() {
    this.isProcessing2FA.set(true);
    
    // Simulate setting up / tearing down 2FA API logic
    setTimeout(() => {
      this.is2FAEnabled.update(v => !v);
      this.isProcessing2FA.set(false);
      this.successMessage.set(this.is2FAEnabled() ? 'Two-Factor Authentication Enabled Successfully' : 'Two-Factor Authentication Disabled');
      
      setTimeout(() => this.successMessage.set(null), 3500);
    }, 1500);
  }

  changePassword() {
    this.passwordError.set(null);
    const form = this.passwordForm();
    
    if (form.newPassword !== form.confirmPassword) {
      this.passwordError.set('New passwords do not match');
      return;
    }

    if (form.newPassword.length < 8) {
      this.passwordError.set('New password must be at least 8 characters long');
      return;
    }

    this.isProcessingPassword.set(true);

    setTimeout(() => {
      this.isProcessingPassword.set(false);
      this.passwordForm.set({ currentPassword: '', newPassword: '', confirmPassword: '' });
      this.successMessage.set('Password Changed Successfully');

      setTimeout(() => this.successMessage.set(null), 3500);
    }, 1500);
  }
}
