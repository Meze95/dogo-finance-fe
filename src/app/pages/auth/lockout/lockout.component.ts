import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-lockout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <main class="min-h-screen grid lg:grid-cols-2 bg-[#f8f7f2]">
      
      <!-- Left Column: Branding / Marketing -->
      <div class="hidden lg:flex flex-col justify-between bg-[#1B4332] p-16 text-white relative overflow-hidden">
        <div class="absolute inset-0 dogo-pattern opacity-[0.05] pointer-events-none"></div>
        <div class="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[150px] opacity-20" style="background: radial-gradient(circle, #C9A84C, transparent)"></div>

        <div class="relative z-10 flex items-center space-x-3">
          <div class="w-10 h-10 bg-[#C9A84C] mask-dogo"></div>
          <span class="text-2xl font-black tracking-tight text-white">DOGO Finance</span>
        </div>

        <div class="relative z-10 w-full max-w-lg mb-20 animate-fade-in">
          <h1 class="text-5xl lg:text-6xl font-black leading-[1.1] mb-6 tracking-tighter">
            We've <span class="text-[#C9A84C]">secured</span><br>your session.
          </h1>
          <p class="text-lg text-white/70 font-medium leading-relaxed mb-12">
            For your protection and peace of mind, we automatically lock inactive sessions to keep your Halal portfolio safe.
          </p>

          <!-- Trust Badges -->
          <div class="bg-white/5 border border-white/10 p-6 rounded-[24px]">
            <div class="flex items-center space-x-4 mb-3">
               <div class="w-10 h-10 bg-[#C9A84C] rounded-full flex items-center justify-center">
                 <i class="ri-shield-keyhole-fill text-[#1B4332]"></i>
               </div>
               <div>
                  <p class="font-black text-white text-sm">Automated Timeouts</p>
                  <p class="text-xs text-white/50 font-bold uppercase tracking-widest mt-1">Bank-level Security Protocol</p>
               </div>
            </div>
          </div>
        </div>

        <!-- Small footer text -->
        <div class="relative z-10 text-xs font-bold uppercase tracking-widest text-white/30">
          &copy; 2026 DOGO Finance Ltd.
        </div>
      </div>

      <!-- Right Column: Lockout Notice -->
      <div class="flex flex-col justify-center px-6 py-12 lg:px-24 xl:px-32 relative">
        
        <!-- Mobile Header -->
        <div class="lg:hidden flex items-center space-x-3 mb-12 justify-center">
          <div class="w-8 h-8 bg-[#1B4332] mask-dogo"></div>
          <span class="text-2xl font-black tracking-tight text-[#1B4332]">DOGO Finance</span>
        </div>

        <div class="w-full max-w-lg mx-auto">
          <div class="animate-fade-in flex flex-col items-center text-center">
            <div class="w-24 h-24 bg-[#1B4332]/5 border-8 border-white shadow-xl rounded-full flex items-center justify-center mb-8 relative">
               <div class="absolute inset-0 rounded-full border-2 border-[#C9A84C]/30 animate-ping"></div>
               <i class="ri-lock-password-fill text-5xl text-[#C9A84C]"></i>
            </div>
            
            <h2 class="text-3xl md:text-4xl font-black text-[#0d1a0f] mb-4 tracking-tighter">Session Expired</h2>
            <p class="text-[#6B7280] font-medium mb-10 leading-relaxed max-w-sm">
                You've been inactive for a while. For your security, you have been securely logged out of your account.
            </p>
            
            <a routerLink="/login" class="w-full h-16 bg-[#1B4332] text-[#C9A84C] font-black rounded-2xl hover:bg-[#2D6A4F] hover:shadow-2xl hover:shadow-[#1B4332]/30 hover:-translate-y-1 transition-all uppercase tracking-widest text-[11px] flex items-center justify-center gap-2">
              Login again <i class="ri-arrow-right-line text-lg"></i>
            </a>
            
            <div class="mt-8">
               <a routerLink="/landing" class="text-[10px] uppercase tracking-widest font-black text-slate-400 hover:text-[#1B4332] transition-colors">Return to Homepage</a>
            </div>
          </div>
        </div>
      </div>
    </main>
  `,
  styles: [`
    .mask-dogo {
        -webkit-mask-image: url('/assets/icons/dogo-icon-simple.svg');
        mask-image: url('/assets/icons/dogo-icon-simple.svg');
        -webkit-mask-size: contain;
        mask-size: contain;
        -webkit-mask-repeat: no-repeat;
        mask-repeat: no-repeat;
        -webkit-mask-position: center;
        mask-position: center;
    }
    .dogo-pattern {
        background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }
  `]
})
export class LockoutComponent { }
