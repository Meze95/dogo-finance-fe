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
    <main class="min-h-screen grid lg:grid-cols-2 bg-[#f8f7f2]">
      
      <!-- Left Column: Branding / Wayfinding Context -->
      <div class="hidden lg:flex flex-col justify-between bg-[#0d1a0f] p-16 text-white relative overflow-hidden">
        <div class="absolute inset-0 dogo-pattern opacity-[0.05] pointer-events-none"></div>
        <div class="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[150px] opacity-10" style="background: radial-gradient(circle, #C9A84C, transparent)"></div>

        <div class="relative z-10 flex items-center space-x-3">
          <div class="w-10 h-10 bg-[#C9A84C] mask-dogo"></div>
          <span class="text-2xl font-black tracking-tight text-white">DOGO Finance</span>
        </div>

        <div class="relative z-10 w-full max-w-lg mb-20 animate-fade-in">
          <h1 class="text-5xl lg:text-6xl font-black leading-[1.1] mb-6 tracking-tighter">
            Lost your <br><span class="text-[#C9A84C]">Way?</span>
          </h1>
          <p class="text-lg text-white/70 font-medium leading-relaxed mb-12">
            The page you are looking for has been moved, removed, renamed or might never have existed. Let us guide you back to our ethical investment hub.
          </p>

          <!-- Navigation Assistance -->
          <div class="bg-white/5 border border-white/10 p-6 rounded-[24px]">
            <div class="flex items-center space-x-4 mb-3">
               <div class="w-10 h-10 bg-[#1B4332] rounded-full flex items-center justify-center">
                 <i class="ri-map-pin-2-fill text-[#C9A84C]"></i>
               </div>
               <div>
                  <p class="font-black text-white text-sm">Wayfinding System</p>
                  <p class="text-xs text-white/50 font-bold uppercase tracking-widest mt-1">Smart Redirection Active</p>
               </div>
            </div>
          </div>
        </div>

        <div class="relative z-10 text-xs font-bold uppercase tracking-widest text-[#C9A84C]/50">
          &copy; 2026 DOGO Finance Ltd.
        </div>
      </div>

      <!-- Right Column: 404 Message -->
      <div class="flex flex-col justify-center px-6 py-12 lg:px-24 xl:px-32 relative">
        <!-- Mobile Header -->
        <div class="lg:hidden flex items-center space-x-3 mb-12 justify-center">
          <div class="w-8 h-8 bg-[#1B4332] mask-dogo"></div>
          <span class="text-2xl font-black tracking-tight text-[#1B4332]">DOGO Finance</span>
        </div>

        <div class="w-full max-w-lg mx-auto text-center lg:text-left animate-in fade-in duration-700">
          <div class="inline-flex items-center justify-center w-24 h-24 bg-amber-50 border-2 border-amber-100 rounded-full mb-8 relative">
            <i class="ri-compass-3-line text-5xl text-[#C9A84C]"></i>
            <div class="absolute top-0 right-0 w-8 h-8 bg-[#1B4332] rounded-full flex items-center justify-center border-4 border-[#f8f7f2] animate-bounce">
              <span class="text-[10px] font-black text-[#C9A84C]">?</span>
            </div>
          </div>

          <h2 class="text-6xl md:text-8xl font-black text-[#0d1a0f] mb-4 tracking-tighter italic uppercase">404</h2>
          <h3 class="text-2xl md:text-3xl font-black text-[#1B4332] mb-6 tracking-tight uppercase">Page Not Found</h3>
          
          <p class="text-[#6B7280] text-lg font-medium mb-12 leading-relaxed">
            We couldn't find the shariah-compliant asset or page you were looking for. Feel free to explore our active opportunities or return to your dashboard.
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            @if(authService.currentUser()) {
              <button (click)="goHome()" class="w-full h-16 bg-[#1B4332] text-[#C9A84C] font-black rounded-2xl hover:bg-black hover:shadow-2xl transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-3">
                <i class="ri-dashboard-fill text-lg"></i> Dashboard
              </button>
            } @else {
              <button routerLink="/" class="w-full h-16 bg-[#1B4332] text-[#C9A84C] font-black rounded-2xl hover:bg-black hover:shadow-2xl transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-3">
                <i class="ri-home-4-line text-lg"></i> Return Home
              </button>
            }
            <button (click)="goBack()" class="w-full h-16 bg-white border border-[#1B4332]/10 text-[#0d1a0f] font-black rounded-2xl hover:bg-[#f8f7f2] transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2">
              <i class="ri-arrow-left-line text-lg"></i> Go Back
            </button>
          </div>

          <div class="mt-12 pt-12 border-t border-dashed border-[#1B4332]/10">
            <p class="text-xs font-black text-[#6B7280]/60 uppercase tracking-widest mb-4">You might be looking for:</p>
            <div class="flex flex-wrap gap-2">
              <a routerLink="/products/growth" class="px-4 py-2 bg-white rounded-full border border-[#1B4332]/5 text-xs font-bold text-[#1B4332] hover:bg-[#C9A84C] hover:text-[#1B4332] transition-all">Opportunities</a>
              <a routerLink="/how-it-works" class="px-4 py-2 bg-white rounded-full border border-[#1B4332]/5 text-xs font-bold text-[#1B4332] hover:bg-[#C9A84C] hover:text-[#1B4332] transition-all">How it works</a>
              <a routerLink="/faq" class="px-4 py-2 bg-white rounded-full border border-[#1B4332]/5 text-xs font-bold text-[#1B4332] hover:bg-[#C9A84C] hover:text-[#1B4332] transition-all">Support Center</a>
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
