import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerReportService, ClientPortfolioReport } from '../../../../shared/services/reports/customer-report.service';
import { AlertService } from '../../../../shared/services/alert.service';
import { DataTablesModule, DataTableDirective } from 'angular-datatables';
import { Config } from 'datatables.net';
import { Subject } from 'rxjs';
import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-client-portfolio',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTablesModule],
  templateUrl: './client-portfolio.html',
})
export class ClientPortfolioComponent implements OnInit, OnDestroy {
  private reportService = inject(CustomerReportService);
  private alertService = inject(AlertService);

  data = signal<ClientPortfolioReport | null>(null);
  isLoading = signal(false);

  @ViewChild(DataTableDirective, {static: false})
  dtElement!: DataTableDirective;

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
            const cName = cProfile?.companyName || 'DOGO FINANCE LIMITED';
            const cAddr = cProfile?.address || '128 Okpanam Road,\nOkpanam,\nDelta State.';

            $(win.document.body)
                .prepend(`
                  <div style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 16px; font-weight: bold;">${cName}</div>
                    <div style="font-size: 10px; white-space: pre-wrap; margin-bottom: 15px;">${cAddr}</div>
                    <h2 style="font-size: 18px; text-transform: uppercase;">Client Portfolio Report</h2>
                  </div>
                `);

            $(win.document.body).find('table')
                .addClass('compact')
                .css('font-size', 'inherit');
          }
        }
      ]
    };

    this.generateReport();
  }

  generateReport() {
    this.isLoading.set(true);
    // Fetch all for datatable
    this.reportService.getClientPortfolioReport(1, 100000).subscribe({
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
}
