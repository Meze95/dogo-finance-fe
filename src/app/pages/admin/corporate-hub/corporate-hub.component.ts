import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/ui/button.component';
import { BadgeComponent } from '../../../shared/components/ui/badge.component';
import { AdminService } from '../../../shared/services/admin.service';

declare var Swal: any;

export interface SettlementNairaAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
  bankBranch: string;
  isDefault: boolean;
}

export interface SettlementDomiciliaryAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
  correspondentBank: string;
  sortCode: string;
  swiftCode: string;
  beneficiaryAccountName: string;
  beneficiaryAccountNo: string;
  isDefault: boolean;
}

export interface CorporateDocument {
  documentId?: number;
  name: string;
  type: string;
  status: 'verified' | 'pending' | 'unverified';
  fileName: string;
  fileSize: string;
  dateUploaded: string;
  notes?: string;
}

export interface CorporateDirector {
  name: string;
  role: string;
  shareholding: number;
  idType: string;
  idNumber: string;
  status: 'Verified' | 'Pending' | 'Unverified';
  
  title?: string;
  surname?: string;
  firstName?: string;
  otherNames?: string;
  dob?: string;
  email?: string;
  phone?: string;
  bvn?: string;
  residentialAddress?: string;
  nationality?: string;
  gender?: string;
  isPep?: string;
  pepDetails?: string;
  passportPhoto?: string;
  signatureImage?: string;
  idDocument?: string;
  signingClass?: string;
}

export interface CorporateRegistration {
  id: string;
  businessName: string;
  rcNumber: string;
  dateSubmitted: string;
  dateIncorporated: string;
  representativeName: string;
  representativeEmail: string;
  representativePhone: string;
  registeredAddress: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  kycProgress: number; // Out of 10
  documents: CorporateDocument[];
  directors: CorporateDirector[];
  signatories?: CorporateDirector[];
  adminNotes?: string;
  dateReviewed?: string;

  // Shariah Company Profile details (as in company profile tab)
  natureOfBusiness?: string;
  tin?: string;
  entityType?: string;
  annualTurnover?: string;
  sourceOfFunds?: string;
  clientSegmentation?: string;
  companyPhone?: string;
  companyEmail?: string;

  // Linked Settlement Accounts
  nairaAccounts?: SettlementNairaAccount[];
  domiciliaryAccounts?: SettlementDomiciliaryAccount[];

  // Primary Contact Person
  contactPerson?: CorporateDirector;
}

@Component({
  selector: 'app-admin-corporate-hub',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, BadgeComponent],
  templateUrl: './corporate-hub.component.html',
  styleUrl: './corporate-hub.component.css'
})
export class CorporateHubComponent implements OnInit {
  private adminService = inject(AdminService);

  // State Signals
  registrations = signal<CorporateRegistration[]>([]);
  selectedRegistration = signal<CorporateRegistration | null>(null);
  selectedDirector = signal<CorporateDirector | null>(null);
  showDetailDrawer = signal(false);
  showDossierModal = signal(false);
  rejectionReason = signal('');
  isProcessing = signal(false);
  
  // Search & Filtering Signals
  activeFilter = signal<'pending' | 'verified'>('pending');
  searchQuery = signal('');
  
  // Custom Document Preview Mockup Signal
  activeDocPreview = signal<{ docName: string; fileName: string; type: string; rcNumber?: string; businessName?: string } | null>(null);

  isAllDocumentsVerified = computed(() => {
    const selected = this.selectedRegistration();
    if (!selected) return false;
    return selected.documents.every(d => d.status === 'verified');
  });

  // Pagination
  currentPage = signal(1);
  pageSize = signal(10);

  isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  ngOnInit() {
    this.loadRegistrations();
  }

  loadRegistrations() {
    if (!this.isBrowser()) {
      return;
    }

    this.adminService.getCorporateRegistrations().subscribe({
      next: (res) => {
        if (res.success) {
          // Transform response to match interface if needed
          this.registrations.set(res.data || []);
        } else {
          console.error('Failed to load corporate registrations', res.message);
        }
      },
      error: (err) => {
        console.error('API Error', err);
      }
    });
  }

  private mapStatus(verifs: any[], type: string): 'verified' | 'pending' | 'unverified' {
    if (!verifs || verifs.length === 0) return 'unverified';
    const found = verifs.find(v => v.type === type);
    if (!found) return 'unverified';
    if (found.status === 'verified') return 'verified';
    if (found.status === 'pending') return 'pending';
    return 'unverified';
  }

  // Computed & Filtering Logic
  filteredRegistrations = computed(() => {
    const filter = this.activeFilter();
    const query = this.searchQuery().toLowerCase().trim();
    
    let list = this.registrations().filter(reg => {
      if (filter === 'pending') {
        return reg.status === 'Pending' || reg.status === 'Rejected';
      } else {
        return reg.status === 'Verified';
      }
    });

    if (query) {
      list = list.filter(reg => 
        reg.businessName.toLowerCase().includes(query) ||
        reg.rcNumber.toLowerCase().includes(query) ||
        reg.representativeName.toLowerCase().includes(query) ||
        reg.representativeEmail.toLowerCase().includes(query) ||
        reg.id.toLowerCase().includes(query)
      );
    }

    return list;
  });

  paginatedRegistrations = computed(() => {
    const list = this.filteredRegistrations();
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    return list.slice(startIndex, startIndex + this.pageSize());
  });

  totalPages = computed(() => Math.ceil(this.filteredRegistrations().length / this.pageSize()));
  pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  setFilter(filter: 'pending' | 'verified') {
    this.activeFilter.set(filter);
    this.currentPage.set(1);
  }

  // Pagination Actions
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

  // Hub Interaction Actions
  viewDetails(reg: CorporateRegistration) {
    this.selectedRegistration.set(reg);
    this.rejectionReason.set(reg.adminNotes || '');
    this.showDetailDrawer.set(true);
  }

  closeDrawer() {
    this.showDetailDrawer.set(false);
    setTimeout(() => {
      this.selectedRegistration.set(null);
      this.activeDocPreview.set(null);
      this.selectedDirector.set(null);
    }, 400);
  }

  closeDossierModal() {
    this.showDossierModal.set(false);
  }

  getInitials(name: string | undefined): string {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    const first = parts[0] ? parts[0].charAt(0) : '';
    const second = parts[1] ? parts[1].charAt(0) : '';
    return (first + second).toUpperCase();
  }

  viewDirectorDetails(dir: CorporateDirector) {
    this.selectedDirector.set(dir);
  }

  closeDirectorDetails() {
    this.selectedDirector.set(null);
  }

  verifyIndividualDocument(doc: CorporateDocument) {
    if (!this.selectedRegistration()) return;
    const selected = this.selectedRegistration()!;
    
    this.adminService.reviewCorporateDocument(selected.id, doc.documentId || 0, { approved: true }).subscribe({
      next: (res) => {
        if (res.success) {
          const updatedDocs = selected.documents.map(d => {
            if (d.type === doc.type) {
              return { ...d, status: 'verified' as const, notes: undefined };
            }
            return d;
          });

          const completedCount = updatedDocs.filter(d => d.status === 'verified').length;

          const updatedList = this.registrations().map(reg => {
            if (reg.id === selected.id) {
              return {
                ...reg,
                documents: updatedDocs,
                kycProgress: completedCount
              };
            }
            return reg;
          });

          this.registrations.set(updatedList);
          const updatedSelected = updatedList.find(r => r.id === selected.id) || null;
          this.selectedRegistration.set(updatedSelected);

          Swal.fire({
            title: 'Document Verified',
            text: `"${doc.name}" has been marked as verified.`,
            icon: 'success',
            confirmButtonColor: '#030E65',
            timer: 1800,
            customClass: {
              popup: 'rounded-[32px]'
            }
          });
        }
      }
    });
  }

  rejectIndividualDocument(doc: CorporateDocument) {
    if (!this.selectedRegistration()) return;
    const selected = this.selectedRegistration()!;

    Swal.fire({
      title: 'Reject Document',
      text: `Enter the reason for rejecting "${doc.name}":`,
      input: 'text',
      inputPlaceholder: 'e.g. Signature missing, expired document, blurred text...',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Confirm Rejection',
      inputValidator: (value: string) => {
        if (!value) {
          return 'You must enter a feedback reason!';
        }
        return null;
      },
      customClass: {
        popup: 'rounded-[32px]'
      }
    }).then((result: any) => {
      if (result.isConfirmed && result.value) {
        const feedback = result.value;

        this.adminService.reviewCorporateDocument(selected.id, doc.documentId || 0, { approved: false, adminNotes: feedback }).subscribe({
          next: (res) => {
            if (res.success) {
              const updatedDocs = selected.documents.map(d => {
                if (d.type === doc.type) {
                  return { ...d, status: 'unverified' as const, notes: feedback };
                }
                return d;
              });

              const completedCount = updatedDocs.filter(d => d.status === 'verified').length;

              const updatedList = this.registrations().map(reg => {
                if (reg.id === selected.id) {
                  return {
                    ...reg,
                    documents: updatedDocs,
                    kycProgress: completedCount
                  };
                }
                return reg;
              });

              this.registrations.set(updatedList);
              const updatedSelected = updatedList.find(r => r.id === selected.id) || null;
              this.selectedRegistration.set(updatedSelected);

              Swal.fire({
                title: 'Document Flagged',
                text: `"${doc.name}" has been rejected.`,
                icon: 'info',
                confirmButtonColor: '#030E65',
                timer: 1800,
                customClass: {
                  popup: 'rounded-[32px]'
                }
              });
            }
          }
        });
      }
    });
  }

  approveRegistration() {
    if (!this.selectedRegistration()) return;
    this.isProcessing.set(true);

    const selected = this.selectedRegistration()!;
    this.adminService.reviewCorporateRegistration(selected.id, { approved: true, adminNotes: this.rejectionReason() }).subscribe({
      next: (res) => {
        if (res.success) {
          const updatedList = this.registrations().map(reg => {
            if (reg.id === selected.id) {
              // Verify all documents in checklist too
              const verifiedDocs = reg.documents.map(d => ({ ...d, status: 'verified' as const }));
              return {
                ...reg,
                status: 'Verified' as const,
                kycProgress: 10,
                documents: verifiedDocs,
                dateReviewed: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                adminNotes: this.rejectionReason() || 'Institutional account verifications validated successfully against registry records.'
              };
            }
            return reg;
          });

          this.registrations.set(updatedList);
          this.isProcessing.set(false);
          
          Swal.fire({
            title: 'Account Verified!',
            text: `Corporate Account for ${selected.businessName} has been approved successfully.`,
            icon: 'success',
            confirmButtonColor: '#030E65',
            customClass: {
              popup: 'rounded-[32px]'
            }
          });
          this.closeDrawer();
        } else {
          this.isProcessing.set(false);
        }
      },
      error: () => this.isProcessing.set(false)
    });
  }

  rejectRegistration() {
    if (!this.selectedRegistration()) return;
    if (!this.rejectionReason().trim()) {
      Swal.fire({
        title: 'Reason Required',
        text: 'Please provide a specific rejection or review reason for the corporate team.',
        icon: 'warning',
        confirmButtonColor: '#030E65',
        customClass: {
          popup: 'rounded-[32px]'
        }
      });
      return;
    }
    
    this.isProcessing.set(true);
    const selected = this.selectedRegistration()!;
    this.adminService.reviewCorporateRegistration(selected.id, { approved: false, adminNotes: this.rejectionReason() }).subscribe({
      next: (res) => {
        if (res.success) {
          const updatedList = this.registrations().map(reg => {
            if (reg.id === selected.id) {
              return {
                ...reg,
                status: 'Rejected' as const,
                dateReviewed: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                adminNotes: this.rejectionReason()
              };
            }
            return reg;
          });

          this.registrations.set(updatedList);
          this.isProcessing.set(false);

          Swal.fire({
            title: 'Review Flagged',
            text: `Corporate Account review sent to ${selected.businessName} with feedback.`,
            icon: 'info',
            confirmButtonColor: '#030E65',
            customClass: {
              popup: 'rounded-[32px]'
            }
          });
          this.closeDrawer();
        } else {
          this.isProcessing.set(false);
        }
      },
      error: () => this.isProcessing.set(false)
    });
  }

  // Launch a CSS custom mockup of the document
  triggerDocumentPreview(doc: CorporateDocument) {
    if (doc.status === 'unverified') return;
    const selected = this.selectedRegistration()!;
    this.activeDocPreview.set({
      docName: doc.name,
      fileName: doc.fileName,
      type: doc.type,
      rcNumber: selected.rcNumber,
      businessName: selected.businessName
    });
  }

  closeDocPreview() {
    this.activeDocPreview.set(null);
  }

  getBadgeVariant(status: string): any {
    const s = status.toLowerCase();
    switch (s) {
      case 'verified':
      case 'active':
      case 'approved':
        return 'success';
      case 'pending':
      case 'review':
        return 'warning';
      case 'rejected':
      case 'locked':
      case 'unverified':
        return 'danger';
      default:
        return 'info';
    }
  }
}
