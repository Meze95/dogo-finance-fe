import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../shared/services/admin.service';

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
  
  // States
  isSaving = signal(false);
  saveSuccess = signal(false);

  ngOnInit() {
    this.loadSettings();
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

    this.adminService.updateSettings(settings).subscribe({
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
