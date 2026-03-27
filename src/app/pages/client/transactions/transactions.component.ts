import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule, BadgeComponent],
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
    { id: '7', reference: 'TRX-98234716', type: 'withdrawal', amount: 25000, status: 'completed', date: 'Feb 15, 2026 • 04:30 PM', description: 'Withdrawal to GTBank', bankInfo: 'Guaranty Trust Bank • 0123456789' }
  ]);

  activeFilter = signal<'all' | 'deposit' | 'withdrawal' | 'profit' | 'investment'>('all');

  filteredTransactions = computed(() => {
    const filter = this.activeFilter();
    if (filter === 'all') return this.transactions();
    return this.transactions().filter(t => t.type === filter);
  });

  selectedTransaction = signal<Transaction | null>(null);

  setFilter(filter: 'all' | 'deposit' | 'withdrawal' | 'profit' | 'investment') {
    this.activeFilter.set(filter);
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
