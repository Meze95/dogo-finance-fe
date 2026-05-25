import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private authService = inject(AuthService);

  userProfile = signal({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
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

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      this.userProfile.set({
        firstName: user.firstName || user.FirstName || 'Staff',
        lastName: user.lastName || user.LastName || 'Member',
        email: user.email || user.Email || '',
        phone: user.phoneNumber || user.PhoneNumber || user.phone || user.Phone || '08000000000',
        role: user.role || user.Role || 'Administrator',
      });
      
      this.is2FAEnabled.set(user.is2faEnabled || user.Is2faEnabled || false);
    }
  }

  toggle2FA() {
    const currentStatus = this.is2FAEnabled();
    const newStatus = !currentStatus;
    
    this.isProcessing2FA.set(true);
    this.successMessage.set(null);
    this.passwordError.set(null);

    this.authService.toggle2fa(newStatus).subscribe({
      next: (res) => {
        this.is2FAEnabled.set(newStatus);
        this.isProcessing2FA.set(false);
        this.successMessage.set(newStatus ? 'Two-Factor Authentication Enabled Successfully' : 'Two-Factor Authentication Disabled');
        
        // Sync active user session
        const user = this.authService.currentUser();
        if (user) {
          user.is2faEnabled = newStatus;
          user.Is2faEnabled = newStatus;
          this.authService.setCurrentUser(user);
        }

        setTimeout(() => this.successMessage.set(null), 3500);
      },
      error: (err) => {
        this.isProcessing2FA.set(false);
        this.passwordError.set(err.error?.message || 'Failed to toggle Two-Factor Authentication.');
      }
    });
  }

  changePassword() {
    this.passwordError.set(null);
    this.successMessage.set(null);
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

    const payload = {
      OldPassword: form.currentPassword,
      NewPassword: form.newPassword,
      ConfirmPassword: form.confirmPassword
    };

    this.authService.changePassword(payload).subscribe({
      next: (res) => {
        this.isProcessingPassword.set(false);
        this.passwordForm.set({ currentPassword: '', newPassword: '', confirmPassword: '' });
        this.successMessage.set('Password Changed Successfully');

        setTimeout(() => this.successMessage.set(null), 3500);
      },
      error: (err) => {
        this.isProcessingPassword.set(false);
        this.passwordError.set(err.error?.message || 'Failed to change password. Please check your current password.');
      }
    });
  }
}
