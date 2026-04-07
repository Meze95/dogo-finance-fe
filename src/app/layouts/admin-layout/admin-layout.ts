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
    { label: 'Overview',     icon: 'ri-dashboard-3-fill',      link: '/admin/dashboard' },
    { label: 'Clients',      icon: 'ri-user-star-line',       link: '/admin/clients' },
    { label: 'Product Management', icon: 'ri-box-3-line',           link: '/admin/products' },
    { label: 'Transactions', icon: 'ri-exchange-funds-fill',  link: '/admin/transactions' }
  ];

  managementItems = [
    { label: 'Role Management', icon: 'ri-shield-keyhole-line', link: '/admin/roles' },
    { label: 'User Hub', icon: 'ri-group-2-line', link: '/admin/users' },
    { label: 'System Config', icon: 'ri-settings-5-line', link: '/admin/settings' },
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
      this.router.navigate(['/login']);
    }, 1800);
  }
}
