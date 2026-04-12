import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvestmentService } from '../../../shared/services/investment.service';
import { AdminUserInvestment } from '../../../shared/models/product.model';
import { BadgeComponent } from '../../../shared/components/ui/badge.component';

@Component({
  selector: 'app-admin-investments',
  standalone: true,
  imports: [CommonModule, FormsModule, BadgeComponent],
  templateUrl: './investments.component.html',
  styleUrl: './investments.component.css'
})
export class AdminInvestmentsComponent implements OnInit {
  private investmentService = inject(InvestmentService);

  allInvestments = this.investmentService.allInvestments;

  searchTerm = signal<string>('');
  currentPage = signal<number>(1);
  pageSize = signal<number>(8);

  filteredInvestments = computed(() => {
    const search = this.searchTerm().toLowerCase();
    const items = this.allInvestments().filter(inv => 
      inv.portfolioName.toLowerCase().includes(search) ||
      inv.clientName.toLowerCase().includes(search) ||
      inv.clientEmail.toLowerCase().includes(search)
    );

    const startIndex = (this.currentPage() - 1) * this.pageSize();
    return items.slice(startIndex, startIndex + this.pageSize());
  });

  totalItems = computed(() => {
    const search = this.searchTerm().toLowerCase();
    return this.allInvestments().filter(inv => 
      inv.portfolioName.toLowerCase().includes(search) ||
      inv.clientName.toLowerCase().includes(search) ||
      inv.clientEmail.toLowerCase().includes(search)
    ).length;
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize())));

  totalAUM = computed(() => this.allInvestments().reduce((sum, inv) => sum + inv.currentValue, 0));

  selectedInvestment = signal<AdminUserInvestment | null>(null);

  ngOnInit() {
    // Service already initializes the data
  }

  updateSearch(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
    this.currentPage.set(1);
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  viewDetails(invest: AdminUserInvestment) {
    this.selectedInvestment.set(invest);
  }

  closeModal() {
    this.selectedInvestment.set(null);
  }
}
