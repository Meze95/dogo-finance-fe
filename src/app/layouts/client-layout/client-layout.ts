import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

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
  isLoggingOut = signal(false);

  private router = inject(Router);

  menuItems = [
    { label: 'Dashboard',    icon: 'ri-dashboard-3-fill',      link: '/client/dashboard' },
    { label: 'My Portfolio', icon: 'ri-pie-chart-2-fill',      link: '/client/portfolio' },
    { label: 'Products',     icon: 'ri-box-3-line',            link: '/client/products' },
    { label: 'Transactions', icon: 'ri-exchange-funds-fill',   link: '/client/transactions' },
  ];

  managementItems = [
    { label: 'Settings', icon: 'ri-settings-4-line', link: '/client/settings' },
    // { label: 'Help & Support', icon: 'ri-questionnaire-line', link: '/client/support' },
  ];

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  handleLogout() {
    if (this.isMobileMenuOpen()) {
      this.toggleMobileMenu();
    }
    this.isLoggingOut.set(true);
    setTimeout(() => {
      this.isLoggingOut.set(false);
      this.router.navigate(['/login']);
    }, 1800);
  }
}
