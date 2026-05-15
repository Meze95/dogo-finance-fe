import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AdminKPI {
  label: string;
  value: string;
  trend: number;
  icon: string;
  color: string;
  sparkline: number[];
}

export interface VerificationTask {
  id: string;
  user: string;
  type: 'KYC' | 'NIN' | 'BVN';
  time: string;
  status: 'pending' | 'reviewing';
}

export interface PlatformActivity {
  id: string;
  type: 'onboarding' | 'transaction' | 'system';
  message: string;
  time: string;
  severity: 'low' | 'medium' | 'high';
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class AdminDashboardComponent {
  // Main Platform Metrics
  totalAUM = signal(14200000000);
  totalUsers = signal(52450);
  activeManagedPools = signal(14);
  
  // High-Level KPIs with sparkline data
  kpis = signal<AdminKPI[]>([
    { label: 'Total AUM (Naira)', value: '₦14.2B', trend: 12.5, icon: 'ri-funds-box-fill', color: 'text-[var(--dogo-secondary)]', sparkline: [40, 45, 42, 48, 52, 50, 58] },
    { label: 'Total Verified Users', value: '52,450', trend: 8.2, icon: 'ri-group-2-fill', color: 'text-green-500', sparkline: [30, 32, 35, 34, 38, 40, 42] },
    { label: 'Net Profit Distributed', value: '₦840M', trend: 15.8, icon: 'ri-medal-fill', color: 'text-[var(--dogo-primary)]', sparkline: [20, 25, 22, 28, 30, 35, 40] },
    { label: 'Pending Compliance', value: '18', trend: -2.1, icon: 'ri-shield-user-fill', color: 'text-red-500', sparkline: [50, 45, 48, 40, 35, 30, 28] }
  ]);

  // Verification Tasks (Onboarding Insight)
  pendingVerifications = signal<VerificationTask[]>([
    { id: 'V-001', user: 'Zubair Al-Farooq', type: 'KYC', time: '12m ago', status: 'pending' },
    { id: 'V-002', user: 'Halima Ibrahim', type: 'BVN', time: '45m ago', status: 'reviewing' },
    { id: 'V-003', user: 'Musa Abdullahi', type: 'NIN', time: '1h ago', status: 'pending' },
    { id: 'V-004', user: 'Aisha Bello', type: 'KYC', time: '2h ago', status: 'pending' }
  ]);

  // Real-time Platform Activities
  platformActivities = signal<PlatformActivity[]>([
    { id: 'ACT-001', type: 'onboarding', message: 'New Client Tier 2 Verification: Ado Bayero', time: 'Just now', severity: 'low' },
    { id: 'ACT-002', type: 'transaction', message: 'Large Transaction Alert: ₦2.5M Sukuk Subscription', time: '5m ago', severity: 'medium' },
    { id: 'ACT-003', type: 'system', message: 'Liquidity Pool Auto-Balance Completed', time: '12m ago', severity: 'low' },
    { id: 'ACT-004', type: 'onboarding', message: 'BVN Rejection: Invalid ID (Kabiru Danladi)', time: '20m ago', severity: 'high' }
  ]);

  // Asset Allocation Data
  assetAllocation = signal([
    { label: 'Real Estate', value: 45, color: 'bg-[var(--dogo-secondary)]' },
    { label: 'Agriculture', value: 30, color: 'bg-[var(--dogo-primary)]' },
    { label: 'Mobility', value: 15, color: 'bg-[var(--dogo-dark)]' },
    { label: 'Cash/Other', value: 10, color: 'bg-slate-300' }
  ]);

  // Onboarding Monthly Trend (last 6 months)
  onboardingTrend = signal([
    { month: 'Oct', users: 1200 },
    { month: 'Nov', users: 1500 },
    { month: 'Dec', users: 1800 },
    { month: 'Jan', users: 2100 },
    { month: 'Feb', users: 2500 },
    { month: 'Mar', users: 3200 }
  ]);

  maxUsers = computed(() => Math.max(...this.onboardingTrend().map(d => d.users)));

  approveTask(id: string) {
    this.pendingVerifications.update(tasks => tasks.filter(t => t.id !== id));
  }

  // Simple helper to generate SVG path for sparklines
  getSparklinePath(data: number[]): string {
    const width = 100;
    const height = 30;
    const padding = 2;
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - (d / 100) * height;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  }
}

