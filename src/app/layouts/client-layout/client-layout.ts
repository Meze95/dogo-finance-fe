import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './client-layout.html',
  styleUrl: './client-layout.css',
})
export class ClientLayout {
  private authService = inject(AuthService);
  private router = inject(Router);

  isSidebarOpen = signal(true);
  isMobileMenuOpen = signal(false);
  isLoggingOut = signal(false);

  user = this.authService.currentUser;

  userName = computed(() => {
    const u = this.user();
    if (!u) return 'Dogo User';
    const first = u.FirstName || u.firstName || 'Dogo';
    const last = u.LastName || u.lastName || 'User';
    return `${first} ${last}`;
  });

  userInitials = computed(() => {
    const u = this.user();
    if (!u) return 'DU';
    const first = u.FirstName || u.firstName || 'D';
    const last = u.LastName || u.lastName || 'U';
    return (first[0] + last[0]).toUpperCase();
  });

  menuItems = [
    { label: 'Dashboard', icon: 'ri-dashboard-3-fill', link: '/client/dashboard' },
    { label: 'Investments', icon: 'ri-funds-box-fill', link: '/client/products' },
    { label: 'Portfolio', icon: 'ri-pie-chart-2-fill', link: '/client/investments' },
    { label: 'Transactions', icon: 'ri-exchange-box-fill', link: '/client/transactions' },
  ];

  managementItems = [
    { label: 'Account', icon: 'ri-settings-4-line', link: '/client/settings' },
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
    this.authService.logout();
    setTimeout(() => {
      this.isLoggingOut.set(false);
      this.router.navigate(['/login']);
    }, 1800);
  }
}
