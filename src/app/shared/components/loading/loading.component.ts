import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loadingService.isLoading()) {
      <div class="loader-overlay fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#f8f7f2]/90 backdrop-blur-md">
        <!-- Modern Geometric Islamic-Inspired Loader -->
        <div class="relative w-24 h-24">
          <!-- Outer rotating ring -->
          <div class="absolute inset-0 border-4 border-[#1B4332]/10 rounded-full"></div>
          <div class="absolute inset-0 border-4 border-t-[#C9A84C] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin-slow"></div>
          
          <!-- Inner geometric shapes -->
          <div class="absolute inset-4 border-2 border-[#1B4332]/20 rounded-full"></div>
          
          <div class="absolute inset-0 flex items-center justify-center">
             <!-- The 'D' Logo Emblem Symbol -->
             <svg width="40" height="40" viewBox="0 0 46 46" fill="none" class="animate-pulse">
                <circle cx="23" cy="23" r="23" fill="#1B4332"/>
                <path d="M14 12h7c5.5 0 10 4.5 10 11s-4.5 11-10 11h-7V12z" fill="none" stroke="#C9A84C" stroke-width="2"/>
                <path d="M18 17h3c3 0 5.5 2.5 5.5 6s-2.5 6-5.5 6h-3V17z" fill="#C9A84C"/>
             </svg>
          </div>
        </div>
        
        <div class="mt-8 flex flex-col items-center">
          <p class="text-[13px] font-black uppercase tracking-[0.2em] text-[#1B4332] opacity-80 animate-pulse">
            Dogo Finance
          </p>
          <div class="mt-2 flex gap-1">
             <div class="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-bounce-1"></div>
             <div class="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-bounce-2"></div>
             <div class="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-bounce-3"></div>
          </div>
        </div>

        <!-- Decorative Pattern backdrop -->
        <div class="absolute inset-0 dogo-pattern opacity-[0.03] pointer-events-none"></div>
      </div>
    }
  `,
  styles: [`
    .loader-overlay {
      transition: all 0.3s ease-in-out;
    }

    .animate-spin-slow {
      animation: spin 2s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .animate-bounce-1 { animation: bounce 1.2s infinite 0.1s; }
    .animate-bounce-2 { animation: bounce 1.2s infinite 0.2s; }
    .animate-bounce-3 { animation: bounce 1.2s infinite 0.3s; }

    @keyframes bounce {
      0%, 80%, 100% { transform: translateY(0); opacity: 0.3; }
      40% { transform: translateY(-4px); opacity: 1; }
    }
  `]
})
export class LoadingComponent {
  loadingService = inject(LoadingService);
}
