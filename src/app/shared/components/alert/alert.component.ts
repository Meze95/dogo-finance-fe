import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      @for (alert of alertService.alerts(); track alert.id) {
        <div class="w-80 overflow-hidden bg-[var(--dogo-cream)] border rounded-[20px] shadow-2xl pointer-events-auto transition-all animate-slide-left p-4 flex gap-4 items-start relative border-white/50"
             [ngClass]="{
               'shadow-green-900/10 border-t-green-200': alert.type === 'success',
               'shadow-red-900/10 border-t-red-200': alert.type === 'error',
               'shadow-blue-900/10 border-t-blue-200': alert.type === 'info',
               'shadow-orange-900/10 border-t-orange-200': alert.type === 'warning',
               'shadow-[var(--dogo-primary)]/10 border-t-[var(--dogo-secondary)]': alert.type === 'loading'
             }">
          
          <div class="w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center border bg-white"
               [ngClass]="{
                 'text-green-600 border-green-100': alert.type === 'success',
                 'text-red-500 border-red-100': alert.type === 'error',
                 'text-blue-500 border-blue-100': alert.type === 'info',
                 'text-orange-500 border-orange-100': alert.type === 'warning',
                 'text-[var(--dogo-secondary)] border-[var(--dogo-secondary)]/20': alert.type === 'loading'
               }">
            @if (alert.type === 'success') { <i class="ri-checkbox-circle-fill text-xl"></i> }
            @if (alert.type === 'error') { <i class="ri-error-warning-fill text-xl"></i> }
            @if (alert.type === 'info') { <i class="ri-information-fill text-xl"></i> }
            @if (alert.type === 'warning') { <i class="ri-alert-fill text-xl"></i> }
            @if (alert.type === 'loading') { <i class="ri-loader-4-line text-xl animate-spin"></i> }
          </div>
          
          <div class="flex-grow pt-0.5">
            <h4 class="text-[12px] font-black tracking-widest uppercase mb-1"
                [ngClass]="{
                   'text-[var(--dogo-primary)]': alert.type === 'loading',
                   'text-slate-800': alert.type !== 'loading'
                }">
                {{ alert.title }}
            </h4>
            <p class="text-[11px] font-bold text-slate-500 leading-tight">{{ alert.message }}</p>
          </div>

          <button (click)="alertService.remove(alert.id)" class="text-slate-300 hover:text-slate-500 transition-colors p-1 shrink-0 -mt-2 -mr-2">
            <i class="ri-close-line text-lg"></i>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .animate-slide-left {
      animation: slideLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    @keyframes slideLeft {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class AlertComponent {
  alertService = inject(AlertService);
}

