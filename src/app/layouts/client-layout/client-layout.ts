import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './client-layout.html',
  styleUrl: './client-layout.css',
})
export class ClientLayout {
  isSidebarOpen = signal(true);
  isMobileMenuOpen = signal(false);

  menuItems = [
    { label: 'Dashboard', icon: 'ri-dashboard-fill', link: '/client/dashboard' },
    { label: 'My Portfolio', icon: 'ri-pie-chart-2-fill', link: '/client/portfolio' },
    { label: 'Halal Savings', icon: 'ri-safe-2-fill', link: '/client/savings' },
    { label: 'Sukuk & Investments', icon: 'ri-bank-fill', link: '/client/investments' },
    { label: 'Zakat Tracking', icon: 'ri-hand-heart-fill', link: '/client/zakat' },
    { label: 'Transactions', icon: 'ri-exchange-funds-fill', link: '/client/transactions' }
  ];

  bottomMenuItems = [
    { label: 'Settings', icon: 'ri-settings-4-line', link: '/client/settings' },
    { label: 'Help & Support', icon: 'ri-questionnaire-line', link: '/client/support' }
  ];

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }
}
