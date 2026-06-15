import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { TransactionService } from '../../../shared/services/transaction.service';

@Component({
  selector: 'app-signatory-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './signatory-dashboard.component.html',
  styleUrl: './signatory-dashboard.component.css'
})
export class SignatoryDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private transactionService = inject(TransactionService);

  user = this.authService.currentUser;
  
  availableNaira = signal(0);
  availableDollar = signal(0);
  pendingApprovals = signal<any[]>([]);

  ngOnInit() {
    this.loadDashboardData();
    this.fetchPendingApprovals();
  }

  loadDashboardData() {
    const customerId = this.user()?.CustomerId || this.user()?.customerId;

    if (customerId) {
        this.transactionService.getWallet(customerId).subscribe({
          next: (res: any) => {
            const isSuccess = res?.success === true || res?.Success === true || res?.boolean === true;
            const data = res?.data || res?.Data;
            
            if (isSuccess && data) {
              this.availableNaira.set(data.balance || data.Balance || 0);
              this.availableDollar.set(data.usdBalance || data.UsdBalance || data.dollarBalance || data.DollarBalance || 0);
            }
          }
        });
    }
  }

  fetchPendingApprovals() {
    this.transactionService.getPendingApprovals().subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.pendingApprovals.set(res.data);
        }
      }
    });
  }
}
