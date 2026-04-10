import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BadgeComponent } from '../../../shared/components/ui/badge.component';

export interface AdminTransaction {
  id: string;
  reference: string;
  clientName: string;
  clientInitials: string;
  type: 'deposit' | 'withdrawal' | 'profit' | 'investment' | 'liquidation';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  description: string;
  paymentMethod?: string;
  bankInfo?: string;
}

@Component({
  selector: 'app-admin-transactions',
  standalone: true,
  imports: [CommonModule, BadgeComponent, FormsModule],
  templateUrl: './transactions.component.html',
})
export class AdminTransactionsComponent {
  transactions = signal<AdminTransaction[]>([
    { id: '1',  reference: 'TRX-882950', clientName: 'Zubair Al-Farooq', clientInitials: 'ZF', type: 'liquidation', amount: 2850000, status: 'completed', date: 'Apr 10, 2026 • 11:30 AM', description: 'Strategy Exit: Halal Growth Strategy' },
    { id: '2',  reference: 'TRX-882949', clientName: 'Halima Ibrahim',   clientInitials: 'HI', type: 'investment', amount: 500000,  status: 'completed', date: 'Apr 09, 2026 • 09:15 AM', description: 'Invest: Agri-Sukuk Al-Murabaha' },
    { id: '3',  reference: 'TRX-98234710', clientName: 'Abubakar Sadiq',   clientInitials: 'AS', type: 'profit',    amount: 18500,  status: 'completed', date: 'Mar 27, 2026 • 10:45 AM', description: 'Mudarabah Q1 Profit Share' },
    { id: '4',  reference: 'TRX-98234711', clientName: 'Fatima Zahra',     clientInitials: 'FZ', type: 'deposit',   amount: 1500000, status: 'completed', date: 'Mar 26, 2026 • 02:15 PM', description: 'Wallet Funding (Bank Transfer)', paymentMethod: 'Bank Transfer' },
    { id: '5',  reference: 'TRX-882948', clientName: 'Umar Farouk',      clientInitials: 'UF', type: 'liquidation', amount: 45000,   status: 'completed', date: 'Mar 25, 2026 • 03:20 PM', description: 'Partial Sell: Ethical Tech (15 units)' },
    { id: '6',  reference: 'TRX-98234713', clientName: 'Ado Bayero',       clientInitials: 'AB', type: 'withdrawal',amount: 250000, status: 'pending',   date: 'Mar 24, 2026 • 11:20 AM', description: 'Withdrawal to Zenith Bank', bankInfo: 'Zenith Bank • 2123456789' },
    { id: '7',  reference: 'TRX-98234715', clientName: 'Zubair Al-Farooq', clientInitials: 'ZF', type: 'profit',    amount: 5000,   status: 'completed', date: 'Feb 28, 2026 • 10:00 AM', description: 'Sukuk Monthly Yield' },
    { id: '8',  reference: 'TRX-98234716', clientName: 'Halima Ibrahim',   clientInitials: 'HI', type: 'withdrawal',amount: 25000,  status: 'completed', date: 'Feb 15, 2026 • 04:30 PM', description: 'Withdrawal to GTBank', bankInfo: 'Guaranty Trust Bank • 0123456789' },
    { id: '9',  reference: 'TRX-98234719', clientName: 'Abubakar Sadiq',   clientInitials: 'AS', type: 'investment',amount: 1000000, status: 'completed', date: 'Jan 30, 2026 • 02:30 PM', description: 'Invest: Real Estate Alpha Pool' },
  ]);

  activeFilter = signal<'all' | 'deposit' | 'withdrawal' | 'profit' | 'investment' | 'liquidation'>('all');
  searchTerm = signal<string>('');
  currentPage = signal<number>(1);
  pageSize = signal<number>(6);

  allFilteredItems = computed(() => {
    const filter = this.activeFilter();
    const search = this.searchTerm().toLowerCase();
    
    return this.transactions().filter(t => {
      const matchesType = filter === 'all' || t.type === filter;
      const matchesSearch = t.clientName.toLowerCase().includes(search) || 
                           t.description.toLowerCase().includes(search) || 
                           t.reference.toLowerCase().includes(search);
      return matchesType && matchesSearch;
    });
  });

  filteredTransactions = computed(() => {
    const items = this.allFilteredItems();
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    return items.slice(startIndex, startIndex + this.pageSize());
  });

  totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.allFilteredItems().length / this.pageSize()));
  });

  selectedTransaction = signal<AdminTransaction | null>(null);

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

  viewDetails(tx: AdminTransaction) {
    this.selectedTransaction.set(tx);
  }

  closeDetails() {
    this.selectedTransaction.set(null);
  }

  getIconForType(type: string) {
    switch (type) {
      case 'deposit':    return 'ri-download-cloud-2-fill text-[#40916C] bg-[#40916C]/10';
      case 'withdrawal': return 'ri-upload-cloud-2-fill text-red-500 bg-red-500/10';
      case 'profit':     return 'ri-sparkling-fill text-[#C9A84C] bg-[#C9A84C]/10';
      case 'investment': return 'ri-briefcase-4-fill text-[#1B4332] bg-[#1B4332]/10';
      case 'liquidation': return 'ri-corner-up-right-double-fill text-blue-600 bg-blue-600/10';
      default:           return 'ri-exchange-funds-fill text-gray-500 bg-gray-500/10';
    }
  }

  getBadgeVariant(status: string): 'success' | 'warning' | 'error' | 'info' | 'gold' | 'dark' {
    switch(status) {
      case 'completed': return 'success';
      case 'pending':   return 'warning';
      case 'failed':    return 'error';
      default:          return 'info';
    }
  }
}
