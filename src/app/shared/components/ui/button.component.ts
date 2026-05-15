import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      (click)="onClick($event)"
      [class]="buttonClasses()"
      class="inline-flex items-center justify-center rounded-2xl font-black uppercase tracking-widest transition-all duration-400 group relative overflow-hidden"
    >
      @if(loading()) {
        <span class="absolute inset-0 flex items-center justify-center bg-inherit bg-opacity-80">
           <i class="ri-loader-4-line animate-spin text-xl"></i>
        </span>
      }
      
      <span class="flex items-center space-x-2" [class.opacity-0]="loading()">
         <ng-content select="[left-icon]"></ng-content>
         <span><ng-content></ng-content></span>
         <ng-content select="[right-icon]"></ng-content>
      </span>
    </button>
  `,
  styles: [`
    button:active { transform: scale(0.96); }
    button:disabled { cursor: not-allowed; opacity: 0.5; }
  `]
})
export class ButtonComponent {
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  type = input<'button' | 'submit' | 'reset'>('button');
  loading = input<boolean>(false);
  disabled = input<boolean>(false);
  
  clicked = output<MouseEvent>();

  buttonClasses = computed(() => {
    let base = '';
    
    // Variant styles
    switch (this.variant()) {
      case 'primary': 
        base = 'bg-[var(--dogo-primary)] text-white hover:bg-[var(--dogo-primary-soft)] hover:shadow-xl hover:shadow-[var(--dogo-primary)]/20';
        break;
      case 'secondary':
        base = 'bg-[var(--dogo-secondary)] text-white hover:bg-[var(--dogo-primary-soft)] hover:shadow-xl hover:shadow-[var(--dogo-secondary)]/20';
        break;
      case 'outline':
        base = 'bg-transparent border-2 border-[var(--dogo-primary)]/10 text-[var(--dogo-primary)] hover:border-[var(--dogo-primary)] hover:bg-[var(--dogo-primary)]/5';
        break;
      case 'danger':
        base = 'bg-red-500 text-white hover:bg-red-600 hover:shadow-xl hover:shadow-red-500/20';
        break;
      case 'ghost':
        base = 'bg-transparent text-[var(--dogo-muted)] hover:text-[var(--dogo-primary)] hover:bg-[var(--dogo-cream)]';
        break;
    }

    // Size styles
    switch (this.size()) {
      case 'sm':  base += ' px-4 py-2 text-[10px]'; break;
      case 'md':  base += ' px-6 py-3 text-[11px]'; break;
      case 'lg':  base += ' px-8 py-4 text-[12px] h-14'; break;
      case 'xl':  base += ' px-12 py-5 text-[13px] h-16'; break;
    }

    return base;
  });

  onClick(event: MouseEvent) {
    if (!this.loading() && !this.disabled()) {
      this.clicked.emit(event);
    }
  }
}


