import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../../shared/components/ui/card.component';
import { ButtonComponent } from '../../../shared/components/ui/button.component';
import { BadgeComponent } from '../../../shared/components/ui/badge.component';
import { AdminService } from '../../../shared/services/admin.service';

declare var Swal: any;

interface VerificationRequest {
  id: number;
  customerName: string;
  customerCode: string;
  documentType: string;
  status: string;
  dateSubmitted: string;
  documentUrl: string;
  extractedAddress?: string;
  extractedCity?: string;
  extractedState?: string;
  adminNotes?: string;
  confidenceScore?: number;
}

@Component({
  selector: 'app-admin-verifications',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent, BadgeComponent],
  templateUrl: './verifications.component.html',
  styleUrl: './verifications.component.css'
})
export class VerificationsComponent {
  private adminService = inject(AdminService);

  requests = signal<VerificationRequest[]>([]);

  selectedRequest = signal<VerificationRequest | null>(null);
  showDetailModal = signal(false);
  rejectionReason = signal('');
  isProcessing = signal(false);

  activeFilter = signal<'all' | 'pending'>('all');
  currentPage = signal(1);
  pageSize = signal(10); // Show more per page in admin

  constructor() {
    this.loadRequests();
  }

  loadRequests() {
    const filterStatus = this.activeFilter() === 'pending' ? 'Pending' : undefined;
    this.adminService.getAddressVerifications(filterStatus).subscribe({
      next: (res) => {
        if (res.data) this.requests.set(res.data);
      }
    });
  }

  filteredRequests = computed(() => {
    let list = this.requests();
    
    // Apply status filter
    if (this.activeFilter() === 'pending') {
      list = list.filter(r => r.status.toLowerCase() === 'pending' || r.status.toLowerCase() === 'review');
    }
    
    return list;
  });

  paginatedRequests = computed(() => {
    const list = this.filteredRequests();
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    return list.slice(startIndex, startIndex + this.pageSize());
  });

  totalPages = computed(() => Math.ceil(this.filteredRequests().length / this.pageSize()));
  pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  setFilter(filter: 'all' | 'pending') {
    this.activeFilter.set(filter);
    this.currentPage.set(1);
    this.loadRequests(); // Reload from backend on filter change
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p: number) => p + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update((p: number) => p - 1);
    }
  }

  goToPage(page: number) {
    this.currentPage.set(page);
  }

  viewDetail(request: VerificationRequest) {
    this.selectedRequest.set(request);
    this.rejectionReason.set('');
    this.showDetailModal.set(true);
  }

  closeModal() {
    this.showDetailModal.set(false);
    this.selectedRequest.set(null);
  }

  approveRequest() {
    if (!this.selectedRequest()) return;
    this.isProcessing.set(true);

    const payload = {
      verificationId: this.selectedRequest()!.id,
      approved: true,
      adminNotes: this.rejectionReason(), // Reusing the notes field
      correctedAddress: this.selectedRequest()!.extractedAddress,
      correctedCity: this.selectedRequest()!.extractedCity,
      correctedState: this.selectedRequest()!.extractedState
    };

    this.adminService.reviewAddressVerification(payload).subscribe({
      next: () => {
        this.isProcessing.set(false);
        Swal.fire('Approved!', 'Customer address has been updated.', 'success');
        this.loadRequests();
        this.closeModal();
      },
      error: () => this.isProcessing.set(false)
    });
  }

  rejectRequest() {
    if (!this.selectedRequest() || !this.rejectionReason()) return;
    this.isProcessing.set(true);

    const payload = {
      verificationId: this.selectedRequest()!.id,
      approved: false,
      adminNotes: this.rejectionReason()
    };

    this.adminService.reviewAddressVerification(payload).subscribe({
      next: () => {
        this.isProcessing.set(false);
        Swal.fire('Rejected', 'The document has been flagged for re-upload.', 'info');
        this.loadRequests();
        this.closeModal();
      },
      error: () => this.isProcessing.set(false)
    });
  }

  getBadgeVariant(status: string): any {
    const s = status.toLowerCase();
    switch (s) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'review': return 'info';
      case 'rejected': return 'danger';
      default: return 'info';
    }
  }
}
