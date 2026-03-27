import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AdminKPI {
  label: string;
  value: string;
  trend: number;
  icon: string;
  color: string;
}

export interface VerificationTask {
  id: string;
  user: string;
  type: 'KYC' | 'NIN' | 'BVN';
  time: string;
  status: 'pending' | 'reviewing';
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class AdminDashboardComponent {
  // System Signals
  totalAUM = signal(14200000000);
  totalUsers = signal(52450);
  activeManagedPools = signal(14);
  
  // KPI Metrics
  kpis = signal<AdminKPI[]>([
    { label: 'Total AUM (Naira)', value: '₦14.2B', trend: 12.5, icon: 'ri-funds-box-fill', color: 'text-[#C9A84C]' },
    { label: 'Total Verified Users', value: '52,450', trend: 8.2, icon: 'ri-group-2-fill', color: 'text-green-500' },
    { label: 'Net Profit Distributed', value: '₦840M', trend: 15.8, icon: 'ri-medal-fill', color: 'text-[#1B4332]' },
    { label: 'Pending Compliance', value: '18', trend: -2.1, icon: 'ri-shield-user-fill', color: 'text-red-500' }
  ]);

  // Pending Verifications
  pendingVerifications = signal<VerificationTask[]>([
    { id: 'V-001', user: 'Zubair Al-Farooq', type: 'KYC', time: '12m ago', status: 'pending' },
    { id: 'V-002', user: 'Halima Ibrahim', type: 'BVN', time: '45m ago', status: 'reviewing' },
    { id: 'V-003', user: 'Musa Abdullahi', type: 'NIN', time: '1h ago', status: 'pending' },
    { id: 'V-004', user: 'Aisha Bello', type: 'KYC', time: '2h ago', status: 'pending' }
  ]);

  // Computed Values
  userGrowthFormatted = computed(() => {
     return this.totalUsers().toLocaleString();
  });

  // Action Methods
  approveTask(id: string) {
    this.pendingVerifications.update(tasks => tasks.filter(t => t.id !== id));
  }
}
