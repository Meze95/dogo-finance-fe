import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loadingService.isLoading()) {
      <div class="loader-overlay fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[var(--dogo-cream)]/90 backdrop-blur-md">
        <!-- Modern Geometric Islamic-Inspired Loader -->
        <div class="relative w-24 h-24">
          <!-- Outer rotating ring -->
          <div class="absolute inset-0 border-4 border-[var(--dogo-primary)]/10 rounded-full"></div>
          <div class="absolute inset-0 border-4 border-t-[var(--dogo-secondary)] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin-slow"></div>
          
          <!-- Inner geometric shapes -->
          <div class="absolute inset-4 border-2 border-[var(--dogo-primary)]/20 rounded-full"></div>
          
          <div class="absolute inset-0 flex items-center justify-center">
             <!-- The 'D' Logo Emblem Symbol -->
             <img src="/brand/icon.png" alt="Dogo" class="w-10 h-10 object-contain animate-pulse">
          </div>
        </div>
        
        <div class="mt-8 flex flex-col items-center">
          <p class="text-[13px] font-black uppercase tracking-[0.2em] text-[var(--dogo-primary)] opacity-80 animate-pulse">
            Dogo Finance
          </p>
          <div class="mt-2 flex gap-1">
             <div class="w-1.5 h-1.5 rounded-full bg-[var(--dogo-secondary)] animate-bounce-1"></div>
             <div class="w-1.5 h-1.5 rounded-full bg-[var(--dogo-secondary)] animate-bounce-2"></div>
             <div class="w-1.5 h-1.5 rounded-full bg-[var(--dogo-secondary)] animate-bounce-3"></div>
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

