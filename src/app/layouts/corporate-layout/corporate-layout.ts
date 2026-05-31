import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { CustomerService } from '../../shared/services/customer.service';

@Component({
  selector: 'app-corporate-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './corporate-layout.html',
  styleUrl: './corporate-layout.css',
})
export class CorporateLayout {
  private authService = inject(AuthService);
  private router = inject(Router);
  private customerService = inject(CustomerService);

  isSidebarOpen = signal(true);
  isMobileMenuOpen = signal(false);
  isLoggingOut = signal(false);
  showNotifications = signal(false);

  notifications = signal<any[]>([]);
  unreadCount = computed(() => this.notifications().filter(n => !n.isRead).length);

  user = this.authService.currentUser;

  userName = computed(() => {
    const u = this.user();
    if (!u) return 'Malik Sherifdeen';
    const first = u.FirstName || u.firstName || 'Malik';
    const last = u.LastName || u.lastName || 'Sherifdeen';
    return `${first} ${last}`;
  });

  userInitials = computed(() => {
    const u = this.user();
    if (!u) return 'MS';
    const first = u.FirstName || u.firstName || 'M';
    const last = u.LastName || u.lastName || 'S';
    return (first[0] + last[0]).toUpperCase();
  });

  menuItems = [
    { label: 'Dashboard', icon: 'ri-dashboard-3-fill', link: '/corporate/dashboard' },
    { label: 'Investments', icon: 'ri-funds-box-fill', link: '/corporate/products' },
    { label: 'My Portfolio', icon: 'ri-pie-chart-2-fill', link: '/corporate/investments' },
    { label: 'Transactions', icon: 'ri-exchange-box-fill', link: '/corporate/transactions' },
  ];

  managementItems = [
    { label: 'Account', icon: 'ri-settings-4-line', link: '/corporate/settings' },
  ];

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.customerService.getNotifications().subscribe({
      next: (res) => {
        if (res.success) {
          this.notifications.set(res.data || []);
        }
      }
    });
  }

  toggleNotifications() {
    this.showNotifications.update(v => !v);
  }

  markAsRead(id: number) {
    this.customerService.markNotificationRead(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.notifications.update(list => list.map(n => n.notificationId === id ? { ...n, isRead: true } : n));
        }
      }
    });
  }

  handleLogout() {
    if (this.isMobileMenuOpen()) {
      this.toggleMobileMenu();
    }
    this.isLoggingOut.set(true);
    // Unprotected logout simulation
    setTimeout(() => {
      this.isLoggingOut.set(false);
      this.router.navigate(['/login']);
    }, 1800);
  }
}
