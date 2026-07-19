import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerReportService, ClientActivityReport } from '../../../../shared/services/reports/customer-report.service';
import { AlertService } from '../../../../shared/services/alert.service';
import { DataTablesModule, DataTableDirective } from 'angular-datatables';
import { Config } from 'datatables.net';
import { Subject } from 'rxjs';
import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-client-activity',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTablesModule],
  templateUrl: './client-activity.html',
  providers: [DatePipe]
})
export class ClientActivityComponent implements OnInit, OnDestroy {
  private reportService = inject(CustomerReportService);
  private alertService = inject(AlertService);
  private datePipe = inject(DatePipe);

  data = signal<ClientActivityReport | null>(null);
  isLoading = signal(false);

  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;

  startDate = '';
  endDate = '';

  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject<any>();
  today = new Date();

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true,
      dom: 'Bfrtip',
      buttons: [
        {
          extend: 'print',
          text: '<i class="fa fa-print"></i> Print Report',
          className: 'bg-[var(--dogo-primary)] text-white px-4 py-2 rounded-md hover:bg-opacity-90 font-semibold',
          title: '',
          messageTop: '',
          customize: (win: any) => {
            const currentData = this.data();
            const cProfile = currentData?.companyProfile;
            const cName = cProfile?.companyName || 'DOGO LIMITED';
            const cAddr = cProfile?.address || '128 Okpanam Road,\nOkpanam,\nDelta State.';

            $(win.document.body)
              .prepend(`
                  <div style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 16px; font-weight: bold;">${cName}</div>
                    <div style="font-size: 10px; white-space: pre-wrap; margin-bottom: 15px;">${cAddr}</div>
                    <h2 style="font-size: 18px; text-transform: uppercase;">Client Activity Report</h2>
                  </div>
                `);

            $(win.document.body).find('table')
              .addClass('compact')
              .css('font-size', 'inherit');
          }
        }
      ]
    };

    // Default dates (e.g. last 30 days)
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);

    this.startDate = this.formatDate(start);
    this.endDate = this.formatDate(end);
  }

  private formatDate(date: Date): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd') || '';
  }

  generateReport() {
    if (!this.startDate || !this.endDate) {
      this.alertService.error('Validation Error', 'Please select both start and end dates.');
      return;
    }

    this.isLoading.set(true);
    // Fetch all for datatable
    this.reportService.getClientActivityReport(this.startDate, this.endDate, 1, 100000).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success || res.status === 200 || res.Status === 200) {
          this.data.set(res.data || res.Data!);
          // Call the dtTrigger to manually render the table
          setTimeout(() => {
            if (this.dtElement && this.dtElement.dtInstance) {
              this.dtElement.dtInstance.then((dtInstance: any) => {
                dtInstance.destroy();
                this.dtTrigger.next(null);
              });
            } else {
              this.dtTrigger.next(null);
            }
          }, 100);
          this.alertService.success('Success', 'Report generated successfully.');
        } else {
          this.alertService.error('Error', res.message || res.Message || 'Failed to load report');
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.alertService.error('Error', 'Failed to communicate with server');
      }
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  getActivityPercents() {
    const d = this.data();
    if (!d) return { active: 0, inactive: 0 };
    const total = d.totalActiveUsers + d.totalInactiveUsers;
    if (total === 0) return { active: 0, inactive: 0 };
    return {
      active: (d.totalActiveUsers / total) * 100,
      inactive: (d.totalInactiveUsers / total) * 100
    };
  }
}
