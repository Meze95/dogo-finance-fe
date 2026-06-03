import { Component, inject, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { UserRole } from '../../shared/models/user-role.enum';

@Component({
  selector: 'app-home-layout',
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './home-layout.html',
  styleUrl: './home-layout.css',
})
export class HomeLayout implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  isMenuOpen = false;
  isLoggedIn = computed(() => this.authService.currentUser() !== null);

  dashboardLink = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return '/login';
    return (user.role === UserRole.Customer || user.Role === 'Customer') ? '/client/dashboard' : '/admin/dashboard';
  });

  handleLogout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  customerTypes = signal<any[]>([
    { id: 1, name: 'Individual', description: 'For personal wealth' },
    { id: 2, name: 'Corporate', description: 'For registered businesses' }
  ]);

  ngOnInit() {
    this.authService.getCustomerTypes().subscribe({
      next: (res) => {
        if (res && res.data) {
          this.customerTypes.set(res.data);
        }
      },
      error: (err) => console.error('Failed to load customer types', err)
    });
  }
}
