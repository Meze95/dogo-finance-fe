import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

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
  openMenu = signal<string | null>(null);
  isLoggingOut = signal(false);

  private router = inject(Router);
  private authService = inject(AuthService);

  menuItems = [
    { label: 'System Overview', icon: 'ri-dashboard-3-fill', link: '/admin/dashboard' },
    { label: 'Clients Hub', icon: 'ri-user-star-line', link: '/admin/clients' },
    { label: 'Plan & Products', icon: 'ri-funds-box-line', link: '/admin/products' },
    { label: 'Investments', icon: 'ri-briefcase-4-fill', link: '/admin/investments' },
    { label: 'Liquidation Requests', icon: 'ri-exchange-funds-line', link: '/admin/liquidation-requests' },
    { label: 'Verifications', icon: 'ri-shield-check-line', link: '/admin/verifications' },
    { label: 'Withdrawal', icon: 'ri-bank-card-line', link: '/admin/withdrawals' }
    // { label: 'System Ledger', icon: 'ri-exchange-box-fill', link: '/admin/transactions' }
  ];

  managementItems = [
    { label: 'Role Management', icon: 'ri-shield-keyhole-line', link: '/admin/roles' },
    { label: 'User Hub', icon: 'ri-group-2-line', link: '/admin/users' },
    { label: 'System Config', icon: 'ri-settings-5-line', link: '/admin/settings' },
    {
      label: 'Financial Reports',
      icon: 'ri-file-chart-line',
      subItems: [
        { label: 'Trial Balance', link: '/admin/reports/trial-balance' }
      ]
    },
    {
      label: 'Account',
      icon: 'ri-user-settings-line',
      subItems: [
        { label: 'Profile', link: '/admin/profile' },
        { label: 'Logout', link: '/admin/logout' }
      ]
    }
  ];

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  toggleSubMenu(menuLabel: string) {
    if (this.openMenu() === menuLabel) {
      this.openMenu.set(null);
    } else {
      this.openMenu.set(menuLabel);
    }
  }

  handleLogout() {
    if (this.isMobileMenuOpen()) {
      this.toggleMobileMenu();
    }

    this.isLoggingOut.set(true);
    this.authService.logout();

    // Give a short delay for the UI animation
    setTimeout(() => {
      this.isLoggingOut.set(false);
      this.router.navigate(['/admin/login']);
    }, 1800);
  }
}
