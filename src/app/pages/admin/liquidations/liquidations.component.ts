import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvestmentService } from '../../../shared/services/investment.service';
import { BadgeComponent } from '../../../shared/components/ui/badge.component';
import Swal from 'sweetalert2';
// Re-triggering build check

@Component({
  selector: 'app-admin-liquidations',
  standalone: true,
  imports: [CommonModule, FormsModule, BadgeComponent],
  templateUrl: './liquidations.component.html',
  styleUrl: './liquidations.component.css'
})
export class AdminLiquidationsComponent implements OnInit {
  private investmentService = inject(InvestmentService);

  liquidationRequests = this.investmentService.liquidationRequests;

  searchTerm = signal<string>('');
  currentPage = signal<number>(1);
  pageSize = signal<number>(8);

  filteredRequests = computed(() => {
    const search = this.searchTerm().toLowerCase();
    const items = this.liquidationRequests().filter(req => 
      req.portfolioName.toLowerCase().includes(search) ||
      req.customerName.toLowerCase().includes(search) ||
      req.email.toLowerCase().includes(search)
    );

    const startIndex = (this.currentPage() - 1) * this.pageSize();
    return items.slice(startIndex, startIndex + this.pageSize());
  });

  totalItems = computed(() => {
    const search = this.searchTerm().toLowerCase();
    return this.liquidationRequests().filter(req => 
      req.portfolioName.toLowerCase().includes(search) ||
      req.customerName.toLowerCase().includes(search) ||
      req.email.toLowerCase().includes(search)
    ).length;
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize())));

  selectedRequest = signal<any | null>(null);
  adminNotes = signal<string>('');
  isReviewing = signal<boolean>(false);

  ngOnInit() {
    this.investmentService.loadLiquidationRequests();
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

  viewDetails(req: any) {
    this.selectedRequest.set(req);
    this.adminNotes.set('');
  }

  closeModal() {
    this.selectedRequest.set(null);
  }

  approveRequest() {
    this.processReview(true);
  }

  rejectRequest() {
    if (!this.adminNotes()) {
        Swal.fire('Error', 'Please provide a reason for rejection in Admin Notes.', 'error');
        return;
    }
    this.processReview(false);
  }

  private processReview(approved: boolean) {
    const req = this.selectedRequest();
    if (!req) return;

    this.isReviewing.set(true);
    this.investmentService.reviewLiquidation(req.id, approved, this.adminNotes()).subscribe({
        next: (res) => {
            this.isReviewing.set(false);
            if (res.success) {
                Swal.fire('Success', res.message, 'success');
                this.closeModal();
            } else {
                Swal.fire('Error', res.message, 'error');
            }
        },
        error: (err) => {
            this.isReviewing.set(false);
            Swal.fire('Error', 'An error occurred while processing the request.', 'error');
        }
    });
  }

  getStatusVariant(status: number): 'warning' | 'info' | 'success' | 'error' {
    switch (status) {
      case 1: return 'warning'; // PENDING_APPROVAL
      case 2: return 'info';    // PENDING_NOTICE
      case 3: return 'success'; // COMPLETED
      case 4: return 'error';   // REJECTED
      default: return 'warning';
    }
  }
}
