import { Component, signal, inject, computed, OnInit, AfterViewInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements OnInit, AfterViewInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

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
      color: '#38bdf8', // Sky Blue
      route: '/products/mudarabah'
    },
    {
      id: 'sukuk',
      name: 'Sukuk',
      desc: 'Asset-backed Islamic bonds giving you predictable, Shariah-certified returns in Naira.',
      return: 'From 12% p.a.',
      icon: 'ri-bank-fill',
      color: '#fbbf24', // Amber/Gold
      route: '/products/sukuk'
    },
    {
      id: 'halal-equity',
      name: 'Halal Equity',
      desc: 'Shariah-screened stocks and ETFs. Our AI removes every Haram element automatically.',
      return: 'Market returns',
      icon: 'ri-line-chart-fill',
      color: '#34d399', // Emerald
      route: '/products/halal-equity'
    },
    {
      id: 'wakala',
      name: 'Wakala',
      desc: 'Appoint DOGO as your trusted agent. We invest on your behalf with full transparency.',
      return: '13% p.a.',
      icon: 'ri-shield-star-fill',
      color: '#818cf8', // Indigo
      route: '/products/wakala'
    }
  ]);

  testimonials = signal<Testimonial[]>([
    {
      name: 'Abdullahi M.',
      location: 'Kano State',
      text: 'I have tried every savings app out there. None gave me the peace of mind that DOGO does. I know my money is growing and my faith is protected.',
      avatar: '/images/testimonial/avatar-2.png',
      product: 'Mudarabah Account'
    },
    {
      name: 'Fatima O.',
      location: 'Lagos, Nigeria',
      text: 'The Zakat calculator alone is worth downloading the app. It auto-calculated my entire portfolio and sent the payment to charity in seconds.',
      avatar: '/images/testimonial/avatar-1.png',
      product: 'Zakat Module'
    },
    {
      name: 'Ibrahim K.',
      location: 'Abuja, FCT',
      text: 'As a business owner, I needed a Shariah-compliant investment platform. DOGO\'s Sukuk marketplace has given me returns I never thought were possible while staying Halal.',
      avatar: '/images/testimonial/avatar-3.png',
      product: 'Sukuk Marketplace'
    }
  ]);

  activeTestimonial = signal<number>(0);

  setTestimonial(i: number) {
    this.activeTestimonial.set(i);
  }

  // Zakat Calculator
  cashSavings = signal<number | null>(null);
  investments = signal<number | null>(null);
  goldValue = signal<number | null>(null);
  zakatResult = signal<number>(0);

  calculateZakat() {
    const cash = this.cashSavings() || 0;
    const inv = this.investments() || 0;
    const gold = this.goldValue() || 0;
    const total = cash + inv + gold;
    this.zakatResult.set(total * 0.025);
  }

  clearZakat() {
    this.cashSavings.set(null);
    this.investments.set(null);
    this.goldValue.set(null);
    this.zakatResult.set(0);
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

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initScrollAnimations();
    }
  }

  private initScrollAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('scroll-animate-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    const animatedElements = document.querySelectorAll(
      '.scroll-animate, .scroll-animate-left, .scroll-animate-right'
    );
    animatedElements.forEach((el) => observer.observe(el));
  }
}


