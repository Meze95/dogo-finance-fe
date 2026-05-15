import { Component, input, output, signal, computed, HostListener, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DropdownOption {
  value: any;
  label: string;
  icon?: string;
  subtitle?: string;
}

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full overflow-visible">
      @if (label()) {
        <label class="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">{{ label() }}</label>
      }
      
      <!-- Dropdown Trigger -->
      <div 
        (click)="toggle($event)"
        [class.border-[var(--dogo-secondary)]]="isOpen()"
        [ngClass]="size() === 'small' ? 'px-4 py-2 rounded-xl' : 'px-6 py-3.5 rounded-2xl'"
        class="w-full bg-[var(--dogo-cream)] border-2 border-transparent hover:border-[var(--dogo-secondary)]/50 focus-within:border-[var(--dogo-secondary)] flex items-center justify-between cursor-pointer transition-all shadow-sm relative z-10"
      >
        <div class="flex items-center space-x-3 min-w-0 flex-grow">
          <!-- Icon handling -->
          @if (currentOption()?.icon) {
            <div [ngClass]="size() === 'small' ? 'w-6 h-6' : 'w-8 h-8'" class="bg-white rounded-lg flex items-center justify-center text-[var(--dogo-primary)]/40 shadow-sm shrink-0">
              <i [class]="currentOption()?.icon || ''" [ngClass]="size() === 'small' ? 'text-sm' : 'text-lg'"></i>
            </div>
          } @else if (placeholderIcon()) {
            <div [ngClass]="size() === 'small' ? 'w-6 h-6' : 'w-8 h-8'" class="bg-white rounded-lg flex items-center justify-center text-[var(--dogo-primary)]/10 shrink-0">
              <i [class]="placeholderIcon() || ''" [ngClass]="size() === 'small' ? 'text-sm' : 'text-lg'"></i>
            </div>
          }
          
          <div class="min-w-0 flex-grow">
            <p class="font-bold text-[var(--dogo-dark)] leading-tight truncate" [ngClass]="size() === 'small' ? 'text-xs' : 'text-sm'">
              {{ currentOption()?.label || placeholder() }}
            </p>
            @if (currentOption()?.subtitle) {
              <p class="text-[8px] font-bold text-[var(--dogo-secondary)] uppercase tracking-[0.1em] mt-0.5 truncate">{{ currentOption()?.subtitle }}</p>
            }
          </div>
        </div>
        
        <i class="ri-arrow-down-s-line text-[var(--dogo-primary)] text-xl transition-transform duration-300 shrink-0 ml-2" [class.rotate-180]="isOpen()"></i>
      </div>

      <!-- Dropdown Options -->
      @if (isOpen()) {
        <div class="absolute top-full left-0 right-0 mt-2 bg-white rounded-[24px] shadow-2xl border border-[var(--dogo-primary)]/10 z-[9999] p-1.5 animate-fade-in-up">
          <div class="max-h-[280px] overflow-y-auto custom-scrollbar space-y-0.5">
            @for (option of options(); track option.value) {
              <div 
                (click)="select(option, $event)"
                class="flex items-center justify-between py-2.5 px-4 rounded-xl hover:bg-[var(--dogo-secondary)]/5 border-2 border-transparent hover:border-[var(--dogo-secondary)]/20 cursor-pointer transition-all group"
              >
                <div class="flex items-center space-x-3 min-w-0">
                  @if (option.icon) {
                    <div class="w-7 h-7 bg-[var(--dogo-cream)] group-hover:bg-white rounded-lg flex items-center justify-center text-[var(--dogo-primary)]/30 transition-colors shrink-0">
                      <i [class]="option.icon + ' text-base'"></i>
                    </div>
                  }
                  <div class="min-w-0">
                    <span class="block font-bold text-[var(--dogo-dark)] text-xs group-hover:text-[var(--dogo-primary)] transition-colors tracking-tight truncate">
                      {{ option.label }}
                    </span>
                    @if (option.subtitle) {
                       <p class="text-[8px] font-bold text-[var(--dogo-secondary)]/60 group-hover:text-[var(--dogo-secondary)] uppercase tracking-widest leading-none mt-0.5 transition-colors truncate">
                         {{ option.subtitle }}
                       </p>
                    }
                  </div>
                </div>
                
                @if (selectedValue() === option.value) {
                  <i class="ri-checkbox-circle-fill text-[var(--dogo-secondary)] text-lg animate-in zoom-in duration-200 shrink-0 ml-2"></i>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
    .animate-fade-in-up {
      animation: fadeInUp 0.2s cubic-bezier(0.19, 1, 0.22, 1);
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(27, 67, 50, 0.1); border-radius: 10px; }
  `]
})
export class DropdownComponent {
  label = input<string>('');
  options = input<DropdownOption[]>([]);
  selectedValue = input<any>(null);
  placeholder = input<string>('Select an option');
  placeholderIcon = input<string>('');
  size = input<'normal' | 'small'>('normal');
  
  valueChange = output<any>();
  
  isOpen = signal(false);
  private elementRef = inject(ElementRef);

  currentOption = computed(() => {
    const opts = this.options();
    const val = this.selectedValue();
    return opts.find(opt => String(opt.value) === String(val));
  });

  toggle(event: MouseEvent) {
    event.stopPropagation();
    this.isOpen.update(v => !v);
  }

  select(option: DropdownOption, event: MouseEvent) {
    event.stopPropagation();
    this.valueChange.emit(option.value);
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}

