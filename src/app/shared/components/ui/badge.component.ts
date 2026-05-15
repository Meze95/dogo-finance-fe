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
      case 'gold':    return 'bg-[var(--dogo-secondary)]/10 text-[var(--dogo-secondary)] border-[var(--dogo-secondary)]/20';
      case 'dark':    return 'bg-[var(--dogo-dark)]/5 text-[var(--dogo-dark)] border-[var(--dogo-dark)]/10';
      default:        return 'bg-blue-50/50 text-blue-700 border-blue-200/50';
    }
  });

  dotClass = computed(() => {
    switch (this.variant()) {
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-orange-500';
      case 'error':   return 'bg-red-500';
      case 'gold':    return 'bg-[var(--dogo-secondary)]';
      case 'dark':    return 'bg-[var(--dogo-dark)]';
      default:        return 'bg-blue-500';
    }
  });
}

