import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportingService } from '../../../../shared/services/reporting.service';
import { AlertService } from '../../../../shared/services/alert.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-trial-balance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trial-balance.html',
  styleUrls: ['./trial-balance.css']
})
export class TrialBalancePage implements OnInit {
  private reportingService = inject(ReportingService);
  private alertService = inject(AlertService);

  reportData = signal<any[]>([]);
  isLoading = signal(false);
  totalDebit = signal(0);
  totalCredit = signal(0);

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.isLoading.set(true);
    this.reportingService.getTrialBalance().subscribe({
      next: (res) => {
        if (res.success) {
          this.reportData.set(res.data);
          this.calculateTotals(res.data);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.alertService.error('Error', 'Failed to fetch trial balance');
        this.isLoading.set(false);
      }
    });
  }

  calculateTotals(data: any[]) {
    let dr = 0;
    let cr = 0;
    data.forEach(item => {
      dr += item.totalDebit;
      cr += item.totalCredit;
    });
    this.totalDebit.set(dr);
    this.totalCredit.set(cr);
  }

  onSeedAccounts() {
    Swal.fire({
      title: 'Seed Accounts',
      text: 'This will initialize the standard Chart of Accounts. Proceed?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, proceed',
      cancelButtonText: 'No, cancel'
    }).then((res: any) => {
      if (res.isConfirmed) {
        this.reportingService.seedAccounts().subscribe({
          next: (resp) => {
            if (resp.success) {
              this.alertService.success('Success', resp.message);
              this.fetchData();
            } else {
              this.alertService.error('Error', resp.message);
            }
          }
        });
      }
    });
  }
}
