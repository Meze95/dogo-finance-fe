import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../../shared/services/transaction.service';
import { CardComponent } from '../../../shared/components/ui/card.component';
import { ButtonComponent } from '../../../shared/components/ui/button.component';

declare var Swal: any;

@Component({
  selector: 'app-corporate-fund-approval',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent],
  templateUrl: './corporate-fund-approval.component.html',
  styleUrl: './corporate-fund-approval.component.css'
})
export class CorporateFundApprovalComponent implements OnInit {
  private transactionService = inject(TransactionService);

  pendingApprovals = signal<any[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.fetchPendingApprovals();
  }

  fetchPendingApprovals() {
    this.isLoading.set(true);
    this.transactionService.getPendingApprovals().subscribe({
      next: (res) => {
        if (res.success) {
          this.pendingApprovals.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
        Swal.fire('Error', 'Failed to load pending approvals.', 'error');
      }
    });
  }

  async processApproval(transactionId: number, isApproved: boolean) {
    const action = isApproved ? 'approve' : 'reject';
    const actionColor = isApproved ? '#10b981' : '#ef4444'; // green : red

    const { value: pin } = await Swal.fire({
      title: `Confirm ${isApproved ? 'Approval' : 'Rejection'}`,
      text: `Please enter your 4-digit transaction PIN to ${action} this transaction.`,
      input: 'password',
      inputPlaceholder: 'Enter PIN',
      inputAttributes: {
        maxlength: '4',
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      showCancelButton: true,
      confirmButtonText: isApproved ? 'Approve' : 'Reject',
      confirmButtonColor: actionColor,
      cancelButtonText: 'Cancel',
      inputValidator: (value: string) => {
        if (!value) {
          return 'You need to write something!';
        }
        if (value.length !== 4) {
          return 'PIN must be 4 digits.';
        }
        return null;
      }
    });

    if (pin) {
      Swal.fire({
        title: 'Processing...',
        text: `Please wait while we ${action} the transaction.`,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      this.transactionService.processApproval(transactionId, isApproved, pin).subscribe({
        next: (res) => {
          if (res.success) {
            Swal.fire('Success', res.message, 'success');
            this.fetchPendingApprovals(); // Refresh list
          } else {
            Swal.fire('Error', res.message, 'error');
          }
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', err.error?.message || `Failed to ${action} transaction.`, 'error');
        }
      });
    }
  }
}
