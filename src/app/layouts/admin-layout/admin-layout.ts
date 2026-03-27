import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {
  isSidebarOpen = signal(true);
  isMobileMenuOpen = signal(false);

  menuItems = [
    { label: 'Overview', icon: 'ri-dashboard-3-fill', link: '/admin/dashboard' },
    { label: 'AUM Metrics', icon: 'ri-funds-box-fill', link: '/admin/aum' },
    { label: 'KYC & Verifications', icon: 'ri-user-shield-fill', link: '/admin/verifications' },
    { label: 'Shariah Monitoring', icon: 'ri-star-smile-fill', link: '/admin/compliance' },
    { label: 'Halal Asset Pool', icon: 'ri-stack-line', link: '/admin/assets' },
    { label: 'Zakat Disbursement', icon: 'ri-hand-heart-fill', link: '/admin/zakat' }
  ];

  managementItems = [
    { label: 'User Hub', icon: 'ri-group-2-line', link: '/admin/users' },
    { label: 'Audit Logs', icon: 'ri-history-line', link: '/admin/logs' },
    { label: 'System Config', icon: 'ri-settings-5-line', link: '/admin/settings' }
  ];

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }
}
