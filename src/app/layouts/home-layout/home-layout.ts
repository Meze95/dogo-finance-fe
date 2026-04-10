import { Component, inject, computed } from '@angular/core';
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
export class HomeLayout {
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
}
