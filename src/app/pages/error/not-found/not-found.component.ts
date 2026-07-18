import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { UserRole } from '../../../shared/models/user-role.enum';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <main class="min-h-screen grid lg:grid-cols-2 bg-[var(--dogo-cream)]">
      
      <!-- Left Column: Branding / Wayfinding Context -->
      <div class="hidden lg:flex flex-col justify-between bg-[var(--dogo-dark)] p-16 text-white relative overflow-hidden">
        <div class="absolute inset-0 dogo-pattern opacity-[0.05] pointer-events-none"></div>
        <div class="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[150px] opacity-10" style="background: radial-gradient(circle, var(--dogo-secondary), transparent)"></div>

        <div class="relative z-10 flex items-center space-x-3">
          <img src="/brand/D LOGO W.png" alt="Dogo Finance" class="h-8 object-contain">
          <span class="text-2xl font-black tracking-tight text-white">DOGO Finance</span>
        </div>

        <div class="relative z-10 w-full max-w-lg mb-20 animate-fade-in">
          <h1 class="text-5xl lg:text-6xl font-black leading-[1.1] mb-6 tracking-tighter">
            Lost your <br><span class="text-[var(--dogo-secondary)]">Way?</span>
          </h1>
          <p class="text-lg text-white/70 font-medium leading-relaxed mb-12">
            The page you are looking for has been moved, removed, renamed or might never have existed. Let us guide you back to our ethical investment hub.
          </p>

          <!-- Navigation Assistance -->
          <div class="bg-white/5 border border-white/10 p-6 rounded-[24px]">
            <div class="flex items-center space-x-4 mb-3">
               <div class="w-10 h-10 bg-[var(--dogo-primary)] rounded-full flex items-center justify-center">
                 <i class="ri-map-pin-2-fill text-[var(--dogo-secondary)]"></i>
               </div>
               <div>
                  <p class="font-black text-white text-sm">Wayfinding System</p>
                  <p class="text-xs text-white/50 font-bold uppercase tracking-widest mt-1">Smart Redirection Active</p>
               </div>
            </div>
          </div>
        </div>

        <div class="relative z-10 text-xs font-bold uppercase tracking-widest text-[var(--dogo-secondary)]/50">
          &copy; 2026 DOGO Finance Ltd.
        </div>
      </div>

      <!-- Right Column: 404 Message -->
      <div class="flex flex-col justify-center px-6 py-12 lg:px-24 xl:px-32 relative">
        <!-- Mobile Header -->
        <div class="lg:hidden flex items-center space-x-3 mb-12 justify-center">
          <img src="/brand/D LOGO W.png" alt="Dogo Finance" class="h-8 object-contain">
          <span class="text-2xl font-black tracking-tight text-[var(--dogo-primary)]">DOGO Finance</span>
        </div>

        <div class="w-full max-w-lg mx-auto text-center lg:text-left animate-in fade-in duration-700">
          <div class="inline-flex items-center justify-center w-24 h-24 bg-amber-50 border-2 border-amber-100 rounded-full mb-8 relative">
            <i class="ri-compass-3-line text-5xl text-[var(--dogo-secondary)]"></i>
            <div class="absolute top-0 right-0 w-8 h-8 bg-[var(--dogo-primary)] rounded-full flex items-center justify-center border-4 border-[var(--dogo-cream)] animate-bounce">
              <span class="text-[10px] font-black text-[var(--dogo-secondary)]">?</span>
            </div>
          </div>

          <h2 class="text-6xl md:text-8xl font-black text-[var(--dogo-dark)] mb-4 tracking-tighter italic uppercase">404</h2>
          <h3 class="text-2xl md:text-3xl font-black text-[var(--dogo-primary)] mb-6 tracking-tight uppercase">Page Not Found</h3>
          
          <p class="text-[var(--dogo-muted)] text-lg font-medium mb-12 leading-relaxed">
            We couldn't find the shariah-compliant asset or page you were looking for. Feel free to explore our active opportunities or return to your dashboard.
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            @if(authService.currentUser()) {
              <button (click)="goHome()" class="w-full h-16 bg-[var(--dogo-primary)] text-white font-black rounded-2xl hover:bg-black hover:shadow-2xl transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-3">
                <i class="ri-dashboard-fill text-lg"></i> Dashboard
              </button>
            } @else {
              <button routerLink="/" class="w-full h-16 bg-[var(--dogo-primary)] text-white font-black rounded-2xl hover:bg-black hover:shadow-2xl transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-3">
                <i class="ri-home-4-line text-lg"></i> Return Home
              </button>
            }
            <button (click)="goBack()" class="w-full h-16 bg-white border border-[var(--dogo-primary)]/10 text-[var(--dogo-dark)] font-black rounded-2xl hover:bg-[var(--dogo-cream)] transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2">
              <i class="ri-arrow-left-line text-lg"></i> Go Back
            </button>
          </div>

          <div class="mt-12 pt-12 border-t border-dashed border-[var(--dogo-primary)]/10">
            <p class="text-xs font-black text-[var(--dogo-muted)]/60 uppercase tracking-widest mb-4">You might be looking for:</p>
            <div class="flex flex-wrap gap-2">
              <a routerLink="/products/growth" class="px-4 py-2 bg-white rounded-full border border-[var(--dogo-primary)]/5 text-xs font-bold text-[var(--dogo-primary)] hover:bg-[var(--dogo-secondary)] hover:text-[var(--dogo-primary)] transition-all">Opportunities</a>
              <a routerLink="/how-it-works" class="px-4 py-2 bg-white rounded-full border border-[var(--dogo-primary)]/5 text-xs font-bold text-[var(--dogo-primary)] hover:bg-[var(--dogo-secondary)] hover:text-[var(--dogo-primary)] transition-all">How it works</a>
              <a routerLink="/faq" class="px-4 py-2 bg-white rounded-full border border-[var(--dogo-primary)]/5 text-xs font-bold text-[var(--dogo-primary)] hover:bg-[var(--dogo-secondary)] hover:text-[var(--dogo-primary)] transition-all">Support Center</a>
            </div>
          </div>
        </div>
      </div>
    </main>
  `,
  styles: [`
    .mask-dogo {
      mask-image: url('data:image/svg+xml;utf8,<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 22h20L12 2z" fill="black"/></svg>');
      mask-size: contain;
      mask-repeat: no-repeat;
      mask-position: center;
      -webkit-mask-image: url('data:image/svg+xml;utf8,<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 22h20L12 2z" fill="black"/></svg>');
      -webkit-mask-size: contain;
      -webkit-mask-repeat: no-repeat;
      -webkit-mask-position: center;
    }
  `]
})
export class NotFoundComponent {
  private location = inject(Location);
  public authService = inject(AuthService);
  private router = inject(Router);

  goBack() {
    this.location.back();
  }

  goHome() {
    const user = this.authService.currentUser();
    if (!user) {
      this.router.navigate(['/']);
      return;
    }

    const userRole = user?.role || user?.Role || user?.userRole || user?.UserRole || '';
    
    if (String(userRole).toLowerCase() === UserRole.SuperAdmin.toLowerCase() || 
        String(userRole).toLowerCase() === UserRole.Admin.toLowerCase()) {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/client/dashboard']);
    }
  }
}

