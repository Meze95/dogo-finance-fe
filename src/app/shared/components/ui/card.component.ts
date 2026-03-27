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
      class="rounded-[40px] p-8 relative overflow-hidden transition-all duration-400 group"
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

  cardClasses = computed(() => {
    switch (this.variant()) {
      case 'dark': return 'bg-[#1B4332] text-white shadow-2xl shadow-[#1B4332]/20 border border-white/10';
      case 'gold': return 'bg-[#C9A84C] text-[#1B4332] shadow-2xl shadow-[#C9A84C]/20 border border-[#f0d98b]';
      case 'flat': return 'bg-[#f8f7f2] border border-[#1B4332]/5 text-[#1B4332]';
      default:     return 'bg-white border border-[#1B4332]/5 shadow-sm hover:shadow-xl hover:shadow-[#1B4332]/5 text-[#0d1a0f]';
    }
  });

  labelClasses = computed(() => {
    switch (this.variant()) {
      case 'dark': return 'text-[#C9A84C]';
      case 'gold': return 'text-[#1B4332]';
      default:     return 'text-[#1B4332]';
    }
  });

  iconWrapperClasses = computed(() => {
    switch (this.variant()) {
      case 'dark': return 'bg-white/10 text-white';
      case 'gold': return 'bg-[#1B4332]/10 text-[#1B4332]';
      default:     return 'bg-[#f8f7f2] text-[#1B4332]';
    }
  });
}
