import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../../shared/components/ui/card.component';
import { ButtonComponent } from '../../../shared/components/ui/button.component';
import { BadgeComponent } from '../../../shared/components/ui/badge.component';

interface VerificationRequest {
  id: string;
  clientName: string;
  clientId: string;
  docType: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  imageUrl: string;
  rejectionReason?: string;
}

@Component({
  selector: 'app-admin-verifications',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent, BadgeComponent],
  templateUrl: './verifications.component.html',
  styleUrl: './verifications.component.css'
})
export class VerificationsComponent {
  requests = signal<VerificationRequest[]>([
    {
      id: 'VR-001',
      clientName: 'Malik Sherifdeen',
      clientId: 'CUST-1024',
      docType: 'Electricity Bill',
      status: 'pending',
      date: '2026-04-18 14:30',
      imageUrl: 'https://images.unsplash.com/photo-1558486012-817176f84c6d?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'VR-002',
      clientName: 'Amina Yusuf',
      clientId: 'CUST-2051',
      docType: 'Bank Statement',
      status: 'pending',
      date: '2026-04-18 12:15',
      imageUrl: 'https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'VR-003',
      clientName: 'Chidi Okoro',
      clientId: 'CUST-3092',
      docType: 'Waste Bill (LAWMA)',
      status: 'approved',
      date: '2026-04-17 10:00',
      imageUrl: 'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'VR-004',
      clientName: 'Suleiman Danjuma',
      clientId: 'CUST-4012',
      docType: 'Electricity Bill',
      status: 'pending',
      date: '2026-04-16 16:45',
      imageUrl: 'https://images.unsplash.com/photo-1558486012-817176f84c6d?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'VR-005',
      clientName: 'Funke Akindele',
      clientId: 'CUST-5088',
      docType: 'Water Bill',
      status: 'pending',
      date: '2026-04-16 09:30',
      imageUrl: 'https://images.unsplash.com/photo-1558486012-817176f84c6d?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'VR-006',
      clientName: 'Ibrahim Babangida',
      clientId: 'CUST-6021',
      docType: 'Bank Statement',
      status: 'rejected',
      date: '2026-04-15 14:00',
      imageUrl: 'https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&w=800&q=80',
      rejectionReason: 'Document expired'
    },
    {
      id: 'VR-007',
      clientName: 'Chioma Ajunwa',
      clientId: 'CUST-7033',
      docType: 'Tenancy Receipt',
      status: 'pending',
      date: '2026-04-15 11:15',
      imageUrl: 'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?auto=format&fit=crop&w=800&q=80'
    }
  ]);

  selectedRequest = signal<VerificationRequest | null>(null);
  showDetailModal = signal(false);
  rejectionReason = signal('');
  isProcessing = signal(false);

  activeFilter = signal<'all' | 'pending'>('all');
  currentPage = signal(1);
  pageSize = signal(5);

  filteredRequests = computed(() => {
    let list = this.requests();
    
    // Apply status filter
    if (this.activeFilter() === 'pending') {
      list = list.filter(r => r.status === 'pending');
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
    this.currentPage.set(1); // Reset to first page on filter change
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
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

    setTimeout(() => {
      const updated = this.requests().map(r => 
        r.id === this.selectedRequest()?.id ? { ...r, status: 'approved' as const } : r
      );
      this.requests.set(updated);
      this.isProcessing.set(false);
      this.closeModal();
    }, 1500);
  }

  rejectRequest() {
    if (!this.selectedRequest() || !this.rejectionReason()) return;
    this.isProcessing.set(true);

    setTimeout(() => {
      const updated = this.requests().map(r => 
        r.id === this.selectedRequest()?.id ? { ...r, status: 'rejected' as const, rejectionReason: this.rejectionReason() } : r
      );
      this.requests.set(updated);
      this.isProcessing.set(false);
      this.closeModal();
    }, 1500);
  }

  getBadgeVariant(status: string): any {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'danger';
      default: return 'info';
    }
  }
}
