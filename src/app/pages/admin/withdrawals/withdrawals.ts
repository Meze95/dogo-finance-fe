import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BadgeComponent } from '../../../shared/components/ui/badge.component';

export interface WithdrawalRequest {
  id: string;
  reference: string;
  clientName: string;
  clientInitials: string;
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  date: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  notes?: string;
}

@Component({
  selector: 'app-withdrawals',
  standalone: true,
  imports: [CommonModule, FormsModule, BadgeComponent],
  templateUrl: './withdrawals.html',
})
export class WithdrawalsComponent {
  withdrawals = signal<WithdrawalRequest[]>([
    { 
      id: '1', 
      reference: 'WD-882950', 
      clientName: 'Zubair Al-Farooq', 
      clientInitials: 'ZF', 
      amount: 250000, 
      status: 'pending', 
      date: 'Apr 12, 2026 • 11:30 AM',
      bankName: 'Guaranty Trust Bank',
      accountNumber: '0123456789',
      accountName: 'Zubair Al-Farooq',
      notes: 'Strategy Exit: Halal Growth Strategy'
    },
    { 
      id: '2', 
      reference: 'WD-882949', 
      clientName: 'Halima Ibrahim', 
      clientInitials: 'HI', 
      amount: 500000, 
      status: 'pending', 
      date: 'Apr 12, 2026 • 09:15 AM',
      bankName: 'Zenith Bank',
      accountNumber: '2001234567',
      accountName: 'Halima Ibrahim'
    },
    { 
      id: '3', 
      reference: 'WD-98234710', 
      clientName: 'Abubakar Sadiq', 
      clientInitials: 'AS', 
      amount: 185000, 
      status: 'completed', 
      date: 'Apr 11, 2026 • 10:45 AM',
      bankName: 'Access Bank',
      accountNumber: '0011223344',
      accountName: 'Abubakar Sadiq'
    },
    { 
      id: '4', 
      reference: 'WD-98234711', 
      clientName: 'Fatima Zahra', 
      clientInitials: 'FZ', 
      amount: 1500000, 
      status: 'rejected', 
      date: 'Apr 10, 2026 • 02:15 PM',
      bankName: 'United Bank for Africa',
      accountNumber: '1234567890',
      accountName: 'Fatima Zahra',
      notes: 'Rejected due to name mismatch'
    }
  ]);

  activeFilter = signal<'all' | 'pending' | 'completed' | 'rejected'>('pending');
  searchTerm = signal<string>('');
  currentPage = signal<number>(1);
  pageSize = signal<number>(6);

  allFilteredItems = computed(() => {
    const filter = this.activeFilter();
    const search = this.searchTerm().toLowerCase();
    
    return this.withdrawals().filter(w => {
      const matchesStatus = filter === 'all' || w.status === filter;
      const matchesSearch = w.clientName.toLowerCase().includes(search) || 
                           w.reference.toLowerCase().includes(search) ||
                           w.bankName.toLowerCase().includes(search);
      return matchesStatus && matchesSearch;
    });
  });

  filteredWithdrawals = computed(() => {
    const items = this.allFilteredItems();
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    return items.slice(startIndex, startIndex + this.pageSize());
  });

  totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.allFilteredItems().length / this.pageSize()));
  });

  selectedWithdrawal = signal<WithdrawalRequest | null>(null);
  isApproving = signal<boolean>(false);
  isRejecting = signal<boolean>(false);
  rejectReason = signal<string>('');

  setFilter(filter: string) {
    this.activeFilter.set(filter as any);
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

  viewDetails(w: WithdrawalRequest) {
    this.selectedWithdrawal.set(w);
    this.isApproving.set(false);
    this.isRejecting.set(false);
    this.rejectReason.set('');
  }

  closeDetails() {
    this.selectedWithdrawal.set(null);
  }

  getBadgeVariant(status: string): 'success' | 'warning' | 'error' | 'info' | 'gold' | 'dark' {
    switch(status) {
      case 'completed': return 'success';
      case 'pending':   return 'warning';
      case 'rejected':  return 'error';
      default:          return 'info';
    }
  }

  approve() {
    const w = this.selectedWithdrawal();
    if (!w) return;
    
    this.isApproving.set(true);
    
    // Simulate API call
    setTimeout(() => {
      this.withdrawals.update(list => 
        list.map(item => item.id === w.id ? { ...item, status: 'completed' as const } : item)
      );
      this.isApproving.set(false);
      this.closeDetails();
    }, 1500);
  }

  startReject() {
    this.isRejecting.set(true);
  }

  cancelReject() {
    this.isRejecting.set(false);
    this.rejectReason.set('');
  }

  confirmReject() {
    const w = this.selectedWithdrawal();
    if (!w || !this.rejectReason().trim()) return;
    
    this.isRejecting.set(true);
    
    // Simulate API call
    setTimeout(() => {
      this.withdrawals.update(list => 
        list.map(item => item.id === w.id ? { ...item, status: 'rejected' as const, notes: this.rejectReason() } : item)
      );
      this.isRejecting.set(false);
      this.closeDetails();
    }, 1500);
  }
}
