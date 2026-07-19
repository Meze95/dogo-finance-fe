import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { UserRole } from '../../../shared/models/user-role.enum';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <main class="min-h-screen grid lg:grid-cols-2 bg-[var(--dogo-cream)]">
      
      <!-- Left Column: Branding / Security Context -->
      <div class="hidden lg:flex flex-col justify-between bg-[var(--dogo-dark)] p-16 text-white relative overflow-hidden">
        <div class="absolute inset-0 dogo-pattern opacity-[0.05] pointer-events-none"></div>
        <div class="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full blur-[150px] opacity-10" style="background: radial-gradient(circle, var(--dogo-secondary), transparent)"></div>

        <div class="relative z-10 flex items-center">
          <img src="/brand/D LOGO FW.png" alt="Dogo" class="h-8 object-contain">
        </div>

        <div class="relative z-10 w-full max-w-lg mb-20 animate-fade-in">
          <h1 class="text-5xl lg:text-6xl font-black leading-[1.1] mb-6 tracking-tighter">
            Access <br><span class="text-[var(--dogo-secondary)]">Denied.</span>
          </h1>
          <p class="text-lg text-white/70 font-medium leading-relaxed mb-12">
            Nigeria's most secure shariah-compliant platform. Your current role does not have the permissions required to view this specific asset node.
          </p>

          <!-- Security Badges -->
          <div class="bg-white/5 border border-white/10 p-6 rounded-[24px]">
            <div class="flex items-center space-x-4 mb-3">
               <div class="w-10 h-10 bg-[var(--dogo-primary)] rounded-full flex items-center justify-center">
                 <i class="ri-shield-user-fill text-[var(--dogo-secondary)]"></i>
               </div>
               <div>
                  <p class="font-black text-white text-sm">Role-Based Protection</p>
                  <p class="text-xs text-white/50 font-bold uppercase tracking-widest mt-1">Tiered System Access</p>
               </div>
            </div>
          </div>
        </div>

        <div class="relative z-10 text-xs font-bold uppercase tracking-widest text-[var(--dogo-secondary)]/50">
          &copy; 2026 DOGO.
        </div>
      </div>

      <!-- Right Column: Denied Message -->
      <div class="flex flex-col justify-center px-6 py-12 lg:px-24 xl:px-32 relative">
        <!-- Mobile Header -->
        <div class="lg:hidden flex items-center justify-center mb-12">
          <img src="/brand/logo.png" alt="Dogo" class="h-8 object-contain">
        </div>

        <div class="w-full max-w-lg mx-auto text-center lg:text-left animate-in fade-in duration-700">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-red-50 border-2 border-red-100 rounded-3xl mb-8">
            <i class="ri-lock-2-line text-4xl text-red-600"></i>
          </div>

          <h2 class="text-4xl md:text-5xl font-black text-[var(--dogo-dark)] mb-4 tracking-tighter italic uppercase">403 Restricted</h2>
          <p class="text-[var(--dogo-muted)] text-lg font-medium mb-12 leading-relaxed">
            Unauthorized Entry Attempt. You've encountered a secure perimeter. If you believe this is a mistake, please reach out to system support.
          </p>

          <div class="space-y-4">
            <button (click)="goHome()" class="w-full h-16 bg-[var(--dogo-primary)] text-white font-black rounded-2xl hover:bg-black hover:shadow-2xl transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-3">
              <i class="ri-dashboard-fill text-lg"></i> Back to Dashboard
            </button>
            <button (click)="goBack()" class="w-full h-16 bg-white border border-[var(--dogo-primary)]/10 text-[var(--dogo-dark)] font-black rounded-2xl hover:bg-[var(--dogo-cream)] transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-3">
              <i class="ri-arrow-left-line text-lg"></i> Return to Previous Page
            </button>
          </div>

          <p class="text-[10px] font-black text-[var(--dogo-muted)]/40 uppercase tracking-[0.3em] mt-20">
            Internal Secure Log: #DENY-{{ today | date:'HHmm' }}-ALPHA
          </p>
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
export class AccessDeniedComponent {
  private location = inject(Location);
  private authService = inject(AuthService);
  private router = inject(Router);
  today = new Date();

  goBack() {
    this.location.back();
  }

  goHome() {
    const user = this.authService.currentUser();
    const userRole = user?.role || user?.Role || user?.userRole || user?.UserRole || '';

    if (String(userRole).toLowerCase() === UserRole.SuperAdmin.toLowerCase() ||
      String(userRole).toLowerCase() === UserRole.Admin.toLowerCase()) {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/client/dashboard']);
    }
  }
}

