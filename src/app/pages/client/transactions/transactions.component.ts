import { Component, signal, computed, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BadgeComponent } from '../../../shared/components/ui/badge.component';
import { TransactionService } from '../../../shared/services/transaction.service';
import { AuthService } from '../../../shared/services/auth.service';

export interface Transaction {
  id: string;
  reference: string;
  type: 'deposit' | 'withdrawal' | 'profit' | 'investment' | 'liquidation';
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'rejected';
  date: string;
  description: string;
  paymentMethod?: string;
  bankInfo?: string;
  portfolioName?: string;
  notes?: string;
}

@Component({
  selector: 'app-client-transactions',
  standalone: true,
  imports: [CommonModule, BadgeComponent, FormsModule],
  templateUrl: './transactions.component.html',
})
export class TransactionsComponent implements OnInit {
  private transactionService = inject(TransactionService);
  private authService = inject(AuthService);
  
  transactions = signal<Transaction[]>([]);
  isLoading = signal<boolean>(false);

  constructor() {
    // Wait for user to be available before loading history
    // This prevents calling the API too early during hydration/refresh
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.loadHistory();
      }
    });
  }

  ngOnInit() {}

  loadHistory() {
    this.isLoading.set(true);
    this.transactionService.getHistory().subscribe({
      next: (res) => {
        if (res.success && Array.isArray(res.data)) {
          const mapped = res.data.map((t: any) => ({
             id: t.id,
             reference: t.reference,
             type: t.type,
             amount: t.amount,
             status: t.status,
             date: this.formatDate(t.date),
             description: t.description
          }));
          this.transactions.set(mapped);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    // Format: Apr 10, 2026 • 09:15 AM
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true 
    }).replace(',', ''); // Remove first comma to match pattern more closely after tweak
  }


  activeFilter = signal<'all' | 'deposit' | 'withdrawal' | 'profit' | 'investment' | 'liquidation'>('all');
  searchTerm = signal<string>('');
  currentPage = signal<number>(1);
  pageSize = signal<number>(6);

  // Fully filtered items (all matching items before pagination)
  allFilteredItems = computed(() => {
    const filter = this.activeFilter();
    const search = this.searchTerm().toLowerCase();
    
    return this.transactions().filter(t => {
      const matchesType = filter === 'all' || t.type === filter;
      const matchesSearch = t.description.toLowerCase().includes(search) || 
                           t.reference.toLowerCase().includes(search) ||
                           t.amount.toString().includes(search);
      return matchesType && matchesSearch;
    });
  });

  // Paged and filtered items
  filteredTransactions = computed(() => {
    const items = this.allFilteredItems();
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    return items.slice(startIndex, startIndex + this.pageSize());
  });

  totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.allFilteredItems().length / this.pageSize()));
  });

  selectedTransaction = signal<Transaction | null>(null);

  setFilter(filter: 'all' | 'deposit' | 'withdrawal' | 'profit' | 'investment' | 'liquidation') {
    this.activeFilter.set(filter);
    this.currentPage.set(1); 
  }

  updateSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.currentPage.set(1); 
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  viewDetails(tx: Transaction) {
    this.selectedTransaction.set(tx);
  }

  closeDetails() {
    this.selectedTransaction.set(null);
  }

  getIconForType(type: string) {
    switch (type) {
      case 'deposit': return 'ri-download-cloud-2-fill text-[var(--dogo-primary)] bg-[var(--dogo-primary)]/10';
      case 'withdrawal': return 'ri-upload-cloud-2-fill text-red-500 bg-red-500/10';
      case 'profit': return 'ri-sparkling-fill text-[var(--dogo-secondary)] bg-[var(--dogo-secondary)]/10';
      case 'investment': return 'ri-briefcase-4-fill text-[var(--dogo-primary)] bg-[var(--dogo-primary)]/10';
      case 'liquidation': return 'ri-corner-up-right-double-fill text-blue-600 bg-blue-600/10';
      default: return 'ri-exchange-funds-fill text-gray-500 bg-gray-500/10';
    }
  }

  getBadgeVariant(status: string): 'success' | 'warning' | 'error' | 'info' | 'gold' | 'dark' {
    switch(status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed':
      case 'rejected': return 'error';
      default: return 'info';
    }
  }
}


