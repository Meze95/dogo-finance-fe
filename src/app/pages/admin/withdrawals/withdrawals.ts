import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BadgeComponent } from '../../../shared/components/ui/badge.component';
import { AdminService } from '../../../shared/services/admin.service';
import { AlertService } from '../../../shared/services/alert.service';

export interface WithdrawalRequest {
  id: string;
  reference: string;
  clientName: string;
  clientInitials: string;
  amount: number;
  status: 'pending' | 'completed' | 'rejected' | 'approved';
  date: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  notes?: string;
  email: string;
}

@Component({
  selector: 'app-withdrawals',
  standalone: true,
  imports: [CommonModule, FormsModule, BadgeComponent],
  templateUrl: './withdrawals.html',
})
export class WithdrawalsComponent implements OnInit {
  private adminService = inject(AdminService);
  private alertService = inject(AlertService);

  withdrawals = signal<WithdrawalRequest[]>([]);

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
                           w.bankName?.toLowerCase().includes(search) ||
                           w.email?.toLowerCase().includes(search);
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

  ngOnInit() {
    this.loadWithdrawals();
  }

  loadWithdrawals() {
    // We fetch all to allow frontend filtering/searching
    this.adminService.getWithdrawals().subscribe({
      next: (res: any) => {
        const data = res?.data || res?.Data || [];
        const mapped: WithdrawalRequest[] = data.map((r: any) => ({
          id: r.id.toString(),
          reference: r.reference,
          clientName: r.customerName,
          clientInitials: this.getInitials(r.customerName),
          amount: r.amount,
          status: r.status.toLowerCase() as any, // 'Pending' -> 'pending'
          date: r.initiatedAt,
          bankName: r.bankName || r.bankCode || 'Unknown',
          accountNumber: r.accountNumber || 'N/A',
          accountName: r.customerName,
          notes: r.adminNotes,
          email: r.email
        }));
        this.withdrawals.set(mapped);
      },
      error: () => this.alertService.error('Error', 'Failed to load withdrawal requests')
    });
  }

  getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name[0].toUpperCase();
  }

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
      case 'completed': 
      case 'approved':  return 'success';
      case 'pending':   return 'warning';
      case 'rejected':  return 'error';
      default:          return 'info';
    }
  }

  approve() {
    const w = this.selectedWithdrawal();
    if (!w) return;
    
    this.isApproving.set(true);
    this.adminService.reviewWithdrawalRequest({
      requestId: parseInt(w.id),
      approved: true,
      adminNotes: 'Approved via dashboard'
    }).subscribe({
      next: (res: any) => {
        this.isApproving.set(false);
        if (res.success || res.Success) {
          this.alertService.success('Approved', 'Withdrawal has been authorized and queued for payout.');
          this.closeDetails();
          this.loadWithdrawals();
        } else {
          this.alertService.error('Review Failed', res.message || 'Could not approve withdrawal');
        }
      },
      error: (err: any) => {
        this.isApproving.set(false);
        this.alertService.error('Error', err.error?.message || 'Payout API communication failure');
      }
    });
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
    this.adminService.reviewWithdrawalRequest({
      requestId: parseInt(w.id),
      approved: false,
      adminNotes: this.rejectReason()
    }).subscribe({
      next: (res: any) => {
        this.isRejecting.set(false);
        if (res.success || res.Success) {
          this.alertService.success('Rejected', 'Withdrawal has been rejected and funds returned to wallet.');
          this.closeDetails();
          this.loadWithdrawals();
        } else {
          this.alertService.error('Review Failed', res.message || 'Could not process rejection');
        }
      },
      error: (err: any) => {
        this.isRejecting.set(false);
        this.alertService.error('Error', err.error?.message || 'Failed to process request');
      }
    });
  }
}
