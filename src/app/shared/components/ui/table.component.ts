import { Component, input, TemplateRef, ContentChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative overflow-x-auto custom-scrollbar rounded-[32px] border border-[#1B4332]/5 bg-white shadow-sm overflow-hidden">
      <table class="w-full text-left text-sm font-medium transition-opacity duration-500">
        <thead class="bg-[#f8f7f2] border-b border-[#1B4332]/5">
          <tr>
            @for(col of columns(); track col.key) {
              <th scope="col" class="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#6B7280]">
                {{ col.label }}
              </th>
            }
          </tr>
        </thead>
        <tbody>
          @for(row of data(); track row) {
            <tr class="border-b border-[#1B4332]/5 hover:bg-[#f8f7f2]/50 transition-colors group">
               @for(col of columns(); track col.key) {
                  <td class="px-6 py-5 align-middle">
                     @if(rowTemplate) {
                        <ng-container *ngTemplateOutlet="rowTemplate; context: { $implicit: row, key: col.key }"></ng-container>
                     } @else {
                        <span class="text-[#0d1a0f] font-bold">{{ row[col.key] }}</span>
                     }
                  </td>
               }
            </tr>
          } @empty {
             <tr>
                <td [attr.colspan]="columns().length" class="px-6 py-20 text-center opacity-40">
                   <div class="flex flex-col items-center">
                      <i class="ri-inbox-archive-line text-5xl mb-4"></i>
                      <p class="font-black uppercase tracking-widest text-xs">No records available</p>
                   </div>
                </td>
             </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    :host { display: block; }
    
    tbody tr:last-child {
      border-bottom: none;
    }
  `]
})
export class TableComponent {
  data = input<any[]>([]);
  columns = input<{ key: string, label: string }[]>([]);

  @ContentChild('rowTemplate') rowTemplate?: TemplateRef<any>;
}
