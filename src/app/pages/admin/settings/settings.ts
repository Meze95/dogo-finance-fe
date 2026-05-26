import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../shared/services/admin.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit {
  private adminService = inject(AdminService);

  // System configurations
  isMaintenanceMode = signal(false);
  sessionTimeout = signal(15);
  maxLoginAttempts = signal(5);
  withdrawalAutoThreshold = signal(50000);

  // Company Profile variables
  companyName = signal('');
  address = signal('');
  phoneNumber = signal('');
  email = signal('');
  rcNumber = signal('');
  dateOfIncorporation = signal('');
  bankName = signal('');
  accountNumber = signal('');
  xLink = signal('');
  facebookLink = signal('');
  
  // States
  isSaving = signal(false);
  saveSuccess = signal(false);

  ngOnInit() {
    this.loadSettings();
    this.loadCompanyProfile();
  }

  formatDate(dateVal: any): string {
    if (!dateVal) return '';
    try {
      const d = new Date(dateVal);
      return d.toISOString().split('T')[0];
    } catch {
      return '';
    }
  }

  loadSettings() {
    this.adminService.getSettings().subscribe({
      next: (res) => {
        const data = res?.data || res?.Data;
        if (data) {
          this.sessionTimeout.set(data.sessionTimeoutInMinutes || 15);
          this.withdrawalAutoThreshold.set(data.withdrawalAutoThreshold || 50000);
        }
      }
    });
  }

  loadCompanyProfile() {
    this.adminService.getCompanyProfile().subscribe({
      next: (res) => {
        const data = res?.data || res?.Data;
        if (data) {
          this.companyName.set(data.companyName || '');
          this.address.set(data.address || '');
          this.phoneNumber.set(data.phoneNumber || '');
          this.email.set(data.email || '');
          this.rcNumber.set(data.rcNumber || '');
          this.dateOfIncorporation.set(this.formatDate(data.dateOfIncorporation));
          this.bankName.set(data.bankName || '');
          this.accountNumber.set(data.accountNumber || '');
          this.xLink.set(data.xLink || '');
          this.facebookLink.set(data.facebookLink || '');
        }
      }
    });
  }

  toggleMaintenance() {
    this.isMaintenanceMode.update(v => !v);
  }

  saveConfig() {
    this.isSaving.set(true);
    this.saveSuccess.set(false);
    
    const settings = {
        sessionTimeoutInMinutes: this.sessionTimeout(),
        withdrawalAutoThreshold: this.withdrawalAutoThreshold()
    };

    const profile = {
        companyName: this.companyName(),
        address: this.address(),
        phoneNumber: this.phoneNumber(),
        email: this.email(),
        rcNumber: this.rcNumber(),
        dateOfIncorporation: this.dateOfIncorporation() ? new Date(this.dateOfIncorporation()).toISOString() : null,
        bankName: this.bankName(),
        accountNumber: this.accountNumber(),
        xLink: this.xLink(),
        facebookLink: this.facebookLink()
    };

    forkJoin({
      settings: this.adminService.updateSettings(settings),
      profile: this.adminService.updateCompanyProfile(profile)
    }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.saveSuccess.set(true);
        setTimeout(() => this.saveSuccess.set(false), 3000);
      },
      error: () => {
        this.isSaving.set(false);
      }
    });
  }
}
