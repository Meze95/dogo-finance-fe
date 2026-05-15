import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CardVariant = 'light' | 'dark' | 'gold' | 'flat';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      [class]="cardClasses()" 
      [class.overflow-hidden]="clip()"
      class="rounded-[40px] p-8 relative transition-all duration-400 group"
    >
      @if (variant() !== 'flat') {
        <div class="absolute inset-0 dogo-pattern opacity-[0.05] pointer-events-none group-hover:opacity-[0.1] transition-opacity duration-500"></div>
      }

      <div class="relative z-10 h-full flex flex-col">
        <div class="flex items-center justify-between mb-8">
           <div class="flex flex-col">
              <span [class]="labelClasses()" class="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
                 {{ title() }}
              </span>
              @if(subtitle()) {
                <span class="text-[11px] font-bold mt-1 text-inherit opacity-40 italic">{{ subtitle() }}</span>
              }
           </div>
           
           @if (icon()) {
              <div [class]="iconWrapperClasses()" class="w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-sm transition-all group-hover:scale-110">
                 <i [class]="icon()" class="text-2xl"></i>
              </div>
           }
        </div>

        <div class="flex-grow">
           <ng-content></ng-content>
        </div>

        <div class="mt-8 flex items-center justify-between">
            <ng-content select="[footer-left]"></ng-content>
            <ng-content select="[footer-right]"></ng-content>
        </div>
      </div>

      <!-- Subtle corner flare for dark/gold variants -->
      @if (variant() === 'dark' || variant() === 'gold') {
         <div class="absolute -bottom-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-[80px]"></div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class CardComponent {
  title = input<string>('');
  subtitle = input<string>('');
  icon = input<string>('');
  variant = input<CardVariant>('light');
  clip = input<boolean>(true);

  cardClasses = computed(() => {
    switch (this.variant()) {
      case 'dark': return 'bg-[var(--dogo-primary)] text-white shadow-2xl shadow-[var(--dogo-primary)]/20 border border-white/10';
      case 'gold': return 'bg-[var(--dogo-secondary)] text-[var(--dogo-primary)] shadow-2xl shadow-[var(--dogo-secondary)]/20 border border-[#f0d98b]';
      case 'flat': return 'bg-[var(--dogo-cream)] border border-[var(--dogo-primary)]/5 text-[var(--dogo-primary)]';
      default:     return 'bg-white border border-[var(--dogo-primary)]/5 shadow-sm hover:shadow-xl hover:shadow-[var(--dogo-primary)]/5 text-[var(--dogo-dark)]';
    }
  });

  labelClasses = computed(() => {
    switch (this.variant()) {
      case 'dark': return 'text-[var(--dogo-secondary)]';
      case 'gold': return 'text-[var(--dogo-primary)]';
      default:     return 'text-[var(--dogo-primary)]';
    }
  });

  iconWrapperClasses = computed(() => {
    switch (this.variant()) {
      case 'dark': return 'bg-white/10 text-white';
      case 'gold': return 'bg-[var(--dogo-primary)]/10 text-[var(--dogo-primary)]';
      default:     return 'bg-[var(--dogo-cream)] text-[var(--dogo-primary)]';
    }
  });
}

