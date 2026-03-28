import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BadgeComponent } from '../../../shared/components/ui/badge.component';

export interface Transaction {
  id: string;
  reference: string;
  type: 'deposit' | 'withdrawal' | 'profit' | 'investment';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  description: string;
  paymentMethod?: string;
  bankInfo?: string;
}

@Component({
  selector: 'app-client-transactions',
  standalone: true,
  imports: [CommonModule, BadgeComponent, FormsModule],
  templateUrl: './transactions.component.html',
})
export class TransactionsComponent {
  transactions = signal<Transaction[]>([
    { id: '1', reference: 'TRX-98234710', type: 'profit', amount: 18500, status: 'completed', date: 'Mar 27, 2026 • 10:45 AM', description: 'Mudarabah Q1 Profit Share' },
    { id: '2', reference: 'TRX-98234711', type: 'deposit', amount: 50000, status: 'completed', date: 'Mar 26, 2026 • 02:15 PM', description: 'Wallet Funding (Monnify)', paymentMethod: 'Card Payment' },
    { id: '3', reference: 'TRX-98234712', type: 'investment', amount: 200000, status: 'completed', date: 'Mar 25, 2026 • 09:30 AM', description: 'Sukuk Al-Ijarah Subscription' },
    { id: '4', reference: 'TRX-98234713', type: 'withdrawal', amount: 12000, status: 'pending', date: 'Mar 24, 2026 • 11:20 AM', description: 'Withdrawal to Zenith Bank', bankInfo: 'Zenith Bank • 2123456789' },
    { id: '5', reference: 'TRX-98234714', type: 'deposit', amount: 100000, status: 'failed', date: 'Mar 20, 2026 • 08:15 AM', description: 'Wallet Funding Failed', paymentMethod: 'Bank Transfer' },
    { id: '6', reference: 'TRX-98234715', type: 'profit', amount: 4500, status: 'completed', date: 'Feb 28, 2026 • 10:00 AM', description: 'Sukuk Monthly Yield' },
    { id: '7', reference: 'TRX-98234716', type: 'withdrawal', amount: 25000, status: 'completed', date: 'Feb 15, 2026 • 04:30 PM', description: 'Withdrawal to GTBank', bankInfo: 'Guaranty Trust Bank • 0123456789' },
    { id: '8', reference: 'TRX-98234717', type: 'profit', amount: 2200, status: 'completed', date: 'Feb 10, 2026 • 09:00 AM', description: 'Agri-Yield Sukuk II Profit' },
    { id: '9', reference: 'TRX-98234718', type: 'deposit', amount: 75000, status: 'completed', date: 'Feb 05, 2026 • 11:45 AM', description: 'Wallet Funding (Bank Transfer)', paymentMethod: 'Bank Transfer' },
    { id: '10', reference: 'TRX-98234719', type: 'investment', amount: 500000, status: 'completed', date: 'Jan 30, 2026 • 02:30 PM', description: 'Real Estate Alpha Pool Subscription' },
    { id: '11', reference: 'TRX-98234720', type: 'withdrawal', amount: 5000, status: 'completed', date: 'Jan 25, 2026 • 10:15 AM', description: 'Withdrawal to Access Bank', bankInfo: 'Access Bank • 3123456789' },
    { id: '12', reference: 'TRX-98234721', type: 'profit', amount: 15000, status: 'completed', date: 'Jan 15, 2026 • 12:00 PM', description: 'Annual Hajj Fund Bonus' },
    { id: '13', reference: 'TRX-98234722', type: 'deposit', amount: 150000, status: 'completed', date: 'Jan 05, 2026 • 08:45 AM', description: 'Initial Account Funding', paymentMethod: 'Direct Debit' },
    { id: '14', reference: 'TRX-98234723', type: 'investment', amount: 100000, status: 'completed', date: 'Jan 01, 2026 • 09:00 AM', description: 'Sukuk Al-Murabaha Entry' }
  ]);

  activeFilter = signal<'all' | 'deposit' | 'withdrawal' | 'profit' | 'investment'>('all');
  searchTerm = signal<string>('');
  currentPage = signal<number>(1);
  pageSize = signal<number>(5);

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

  setFilter(filter: 'all' | 'deposit' | 'withdrawal' | 'profit' | 'investment') {
    this.activeFilter.set(filter);
    this.currentPage.set(1); // Reset to page 1 on filter change
  }

  updateSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.currentPage.set(1); // Reset to page 1 on search
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
      case 'deposit': return 'ri-arrow-down-circle-fill text-green-500 bg-green-500/10';
      case 'withdrawal': return 'ri-arrow-up-circle-fill text-red-500 bg-red-500/10';
      case 'profit': return 'ri-medal-fill text-[#C9A84C] bg-[#C9A84C]/10';
      case 'investment': return 'ri-briefcase-4-fill text-blue-500 bg-blue-500/10';
      default: return 'ri-exchange-funds-fill text-gray-500 bg-gray-500/10';
    }
  }

  getBadgeVariant(status: string): 'success' | 'warning' | 'error' | 'info' | 'gold' | 'dark' {
    switch(status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'info';
    }
  }
}
