import { Component, signal, inject, OnInit, computed } from '@angular/core';
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
export class AdminLayout implements OnInit {
  isSidebarOpen = signal(true);
  isMobileMenuOpen = signal(false);
  openMenu = signal<string | null>(null);
  isLoggingOut = signal(false);

  private router = inject(Router);
  private authService = inject(AuthService);

  staffProfile = computed(() => {
    const user = this.authService.currentUser();
    if (!user) {
      return {
        initials: 'SA',
        fullName: 'Super Admin',
        roleName: 'Full Access'
      };
    }
    const fName = user.firstName || user.FirstName || 'Staff';
    const lName = user.lastName || user.LastName || 'Member';
    const initials = (fName.charAt(0) + lName.charAt(0)).toUpperCase();
    const fullName = `${fName} ${lName}`;
    const roleName = user.role || user.Role || 'Administrator';
    return {
      initials,
      fullName,
      roleName
    };
  });

  ngOnInit() {
    // Computed handles state reactively now
  }

  menuItems: Array<{
    label: string;
    icon: string;
    link: string;
    permission?: string;
  }> = [
    { label: 'System Overview', icon: 'ri-dashboard-3-fill', link: '/admin/dashboard', permission: 'ViewDashboard' },
    { label: 'Clients Hub', icon: 'ri-user-star-line', link: '/admin/clients', permission: 'ViewClients' },
    { label: 'Plan & Products', icon: 'ri-funds-box-line', link: '/admin/products', permission: 'ViewProducts' },
    { label: 'Investments', icon: 'ri-briefcase-4-fill', link: '/admin/investments', permission: 'ViewInvestments' },
    { label: 'Liquidation Requests', icon: 'ri-exchange-funds-line', link: '/admin/liquidation-requests', permission: 'ViewLiquidations' },
    { label: 'Verifications', icon: 'ri-shield-check-line', link: '/admin/verifications', permission: 'ViewVerifications' },
    { label: 'Withdrawal', icon: 'ri-bank-card-line', link: '/admin/withdrawals', permission: 'ViewWithdrawals' }
    // { label: 'System Ledger', icon: 'ri-exchange-box-fill', link: '/admin/transactions' }
  ];

  managementItems: Array<{
    label: string;
    icon: string;
    link?: string;
    permission?: string;
    subItems?: Array<{
      label: string;
      link: string;
      permission?: string;
    }>;
  }> = [
    { label: 'Role Management', icon: 'ri-shield-keyhole-line', link: '/admin/roles', permission: 'ViewRoles' },
    { label: 'User Hub', icon: 'ri-group-2-line', link: '/admin/users', permission: 'ViewAdmins' },
    { label: 'System Config', icon: 'ri-settings-5-line', link: '/admin/settings', permission: 'ViewSettings' },
    {
      label: 'Financial Reports',
      icon: 'ri-file-chart-line',
      subItems: [
        { label: 'Trial Balance', link: '/admin/reports/trial-balance', permission: 'ViewTrialBalance' }
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

  hasPermission(permissionName?: string): boolean {
    if (!permissionName) return true;
    const user = this.authService.currentUser();
    if (!user) return false;

    // SuperAdmin always has full bypass access
    const role = user.role || user.Role || user.userRole || user.UserRole;
    if (role?.toLowerCase() === 'superadmin') return true;

    const permissions: string[] = user.permissions || user.Permissions || [];
    return permissions.some(p => p.toLowerCase() === permissionName.toLowerCase());
  }

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
