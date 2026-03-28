import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  // System configurations
  isMaintenanceMode = signal(false);
  sessionTimeout = signal(15);
  maxLoginAttempts = signal(5);
  minimumWithdrawal = signal(50000);
  
  // States
  isSaving = signal(false);
  saveSuccess = signal(false);

  toggleMaintenance() {
    this.isMaintenanceMode.update(v => !v);
  }

  saveConfig() {
    this.isSaving.set(true);
    this.saveSuccess.set(false);
    
    // Simulate API logic
    setTimeout(() => {
      this.isSaving.set(false);
      this.saveSuccess.set(true);
      
      setTimeout(() => {
        this.saveSuccess.set(false);
      }, 3000);
    }, 1500);
  }
}
