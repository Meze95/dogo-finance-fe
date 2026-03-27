import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'gold' | 'dark';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span 
      [class]="badgeClasses()"
      class="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border flex items-center w-fit space-x-1 whitespace-nowrap"
    >
      @if(dot()) {
        <span class="w-1.5 h-1.5 rounded-full mr-1.5" [class]="dotClass()"></span>
      }
      <ng-content></ng-content>
    </span>
  `
})
export class BadgeComponent {
  variant = input<BadgeVariant>('info');
  dot = input<boolean>(false);

  badgeClasses = computed(() => {
    switch (this.variant()) {
      case 'success': return 'bg-green-50/50 text-green-700 border-green-200/50';
      case 'warning': return 'bg-orange-50/50 text-orange-700 border-orange-200/50';
      case 'error':   return 'bg-red-50/50 text-red-700 border-red-200/50';
      case 'gold':    return 'bg-[#C9A84C]/10 text-[#C9A84C] border-[#C9A84C]/20';
      case 'dark':    return 'bg-[#0d1a0f]/5 text-[#0d1a0f] border-[#0d1a0f]/10';
      default:        return 'bg-blue-50/50 text-blue-700 border-blue-200/50';
    }
  });

  dotClass = computed(() => {
    switch (this.variant()) {
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-orange-500';
      case 'error':   return 'bg-red-500';
      case 'gold':    return 'bg-[#C9A84C]';
      case 'dark':    return 'bg-[#0d1a0f]';
      default:        return 'bg-blue-500';
    }
  });
}
