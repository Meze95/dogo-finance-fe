import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BadgeComponent } from '../../../shared/components/ui/badge.component';
import { AdminService } from '../../../shared/services/admin.service';
import { AlertService } from '../../../shared/services/alert.service';

export interface ManualFundingRequest {
  id: string;
  reference: string;
  clientName: string;
  clientInitials: string;
  amount: number;
  status: 'pending' | 'completed' | 'rejected' | 'approved';
  date: string;
  receiptPath?: string;
  notes?: string;
  email: string;
}

@Component({
  selector: 'app-manual-fund-approval',
  standalone: true,
  imports: [CommonModule, FormsModule, BadgeComponent],
  templateUrl: './manual-fund-approval.html',
})
export class ManualFundApprovalComponent implements OnInit {
  private adminService = inject(AdminService);
  private alertService = inject(AlertService);

  requests = signal<ManualFundingRequest[]>([]);

  activeFilter = signal<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  searchTerm = signal<string>('');
  currentPage = signal<number>(1);
  pageSize = signal<number>(6);

  allFilteredItems = computed(() => {
    const filter = this.activeFilter();
    const search = this.searchTerm().toLowerCase();
    
    return this.requests().filter(r => {
      const matchesStatus = filter === 'all' || r.status === filter;
      const matchesSearch = r.clientName.toLowerCase().includes(search) || 
                           r.reference.toLowerCase().includes(search) ||
                           r.email?.toLowerCase().includes(search);
      return matchesStatus && matchesSearch;
    });
  });

  filteredRequests = computed(() => {
    const items = this.allFilteredItems();
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    return items.slice(startIndex, startIndex + this.pageSize());
  });

  totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.allFilteredItems().length / this.pageSize()));
  });

  selectedRequest = signal<ManualFundingRequest | null>(null);
  isApproving = signal<boolean>(false);
  isRejecting = signal<boolean>(false);
  rejectReason = signal<string>('');
  approveNote = signal<string>('Approved via admin dashboard');

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.adminService.getManualFundingRequests().subscribe({
      next: (res: any) => {
        const data = res?.data || res?.Data || [];
        const mapped: ManualFundingRequest[] = data.map((r: any) => ({
          id: r.id.toString(),
          reference: r.reference,
          clientName: r.customerName || 'Unknown',
          clientInitials: this.getInitials(r.customerName),
          amount: r.amount,
          status: r.status.toLowerCase() as any, // 'Pending' -> 'pending'
          date: r.initiatedAt,
          receiptPath: r.receiptPath,
          notes: r.adminNotes,
          email: r.email || ''
        }));
        this.requests.set(mapped);
      },
      error: () => this.alertService.error('Error', 'Failed to load manual funding requests')
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

  viewDetails(r: ManualFundingRequest) {
    this.selectedRequest.set(r);
    this.isApproving.set(false);
    this.isRejecting.set(false);
    this.rejectReason.set('');
    this.approveNote.set('Approved via admin dashboard');
  }

  closeDetails() {
    this.selectedRequest.set(null);
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
    const r = this.selectedRequest();
    if (!r) return;
    
    this.isApproving.set(true);
    this.adminService.reviewManualFundingRequest({
      requestId: parseInt(r.id),
      status: 'Approved',
      adminNotes: this.approveNote()
    }).subscribe({
      next: (res: any) => {
        this.isApproving.set(false);
        if (res.success || res.Success) {
          this.alertService.success('Approved', 'Manual funding has been approved and wallet credited.');
          this.closeDetails();
          this.loadRequests();
        } else {
          this.alertService.error('Review Failed', res.message || 'Could not approve manual funding');
        }
      },
      error: (err: any) => {
        this.isApproving.set(false);
        this.alertService.error('Error', err.error?.message || 'API communication failure');
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
    const r = this.selectedRequest();
    if (!r || !this.rejectReason().trim()) return;
    
    this.isRejecting.set(true);
    this.adminService.reviewManualFundingRequest({
      requestId: parseInt(r.id),
      status: 'Rejected',
      adminNotes: this.rejectReason()
    }).subscribe({
      next: (res: any) => {
        this.isRejecting.set(false);
        if (res.success || res.Success) {
          this.alertService.success('Rejected', 'Manual funding has been rejected.');
          this.closeDetails();
          this.loadRequests();
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
