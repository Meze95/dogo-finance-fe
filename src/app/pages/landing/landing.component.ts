import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { UserRole } from '../../shared/models/user-role.enum';

interface Product {
  id: string;
  name: string;
  desc: string;
  return: string;
  icon: string;
  color: string;
  route: string;
}

interface Testimonial {
  name: string;
  location: string;
  text: string;
  avatar: string;
  product: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoggedIn = computed(() => this.authService.currentUser() !== null);
  
  dashboardLink = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return '/login';
    return user.role === UserRole.Customer ? '/client/dashboard' : '/admin/dashboard';
  });

  handleLogout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  products = signal<Product[]>([
    {
      id: 'mudarabah',
      name: 'Mudarabah',
      desc: 'You provide capital. We manage it expertly. Profits shared — no Riba, ever.',
      return: 'Up to 18% p.a.',
      icon: 'ri-seedling-fill',
      color: '#1B4332',
      route: '/products/mudarabah'
    },
    {
      id: 'sukuk',
      name: 'Sukuk',
      desc: 'Asset-backed Islamic bonds giving you predictable, Shariah-certified returns in Naira.',
      return: 'From 12% p.a.',
      icon: 'ri-bank-fill',
      color: '#C9A84C',
      route: '/products/sukuk'
    },
    {
      id: 'halal-equity',
      name: 'Halal Equity',
      desc: 'Shariah-screened stocks and ETFs. Our AI removes every Haram element automatically.',
      return: 'Market returns',
      icon: 'ri-line-chart-fill',
      color: '#2D6A4F',
      route: '/products/halal-equity'
    },
    {
      id: 'wakala',
      name: 'Wakala',
      desc: 'Appoint DOGO Finance as your trusted agent. We invest on your behalf with full transparency.',
      return: '13% p.a.',
      icon: 'ri-shield-star-fill',
      color: '#9a7a2b',
      route: '/products/wakala'
    }
  ]);

  testimonials = signal<Testimonial[]>([
    {
      name: 'Abdullahi M.',
      location: 'Kano State',
      text: 'I have tried every savings app out there. None gave me the peace of mind that DOGO Finance does. I know my money is growing and my faith is protected.',
      avatar: 'https://i.pravatar.cc/100?img=12',
      product: 'Mudarabah Account'
    },
    {
      name: 'Fatima O.',
      location: 'Lagos, Nigeria',
      text: 'The Zakat calculator alone is worth downloading the app. It auto-calculated my entire portfolio and sent the payment to charity in seconds.',
      avatar: 'https://i.pravatar.cc/100?img=47',
      product: 'Zakat Module'
    },
    {
      name: 'Ibrahim K.',
      location: 'Abuja, FCT',
      text: 'As a business owner, I needed a Shariah-compliant investment platform. DOGO Finance\'s Sukuk marketplace has given me returns I never thought were possible while staying Halal.',
      avatar: 'https://i.pravatar.cc/100?img=33',
      product: 'Sukuk Marketplace'
    }
  ]);

  activeTestimonial = signal<number>(0);

  setTestimonial(i: number) {
    this.activeTestimonial.set(i);
  }
}
