import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvestmentService } from '../../../shared/services/investment.service';
import { UserInvestment, InstrumentHolding } from '../../../shared/models/product.model';

declare var Swal: any;

@Component({
  selector: 'app-client-investments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './investments.component.html',
  styleUrl: './investments.component.css'
})
export class ClientInvestmentsComponent implements OnInit {
  private investmentService = inject(InvestmentService);

  userInvestments = this.investmentService.userInvestments;
  
  totalPortfolioValue = computed(() => 
    this.userInvestments().reduce((sum, inv) => sum + inv.currentValue, 0)
  );

  totalGrowth = computed(() => {
    const totalInvested = this.userInvestments().reduce((sum, inv) => sum + inv.totalInvested, 0);
    return this.totalPortfolioValue() - totalInvested;
  });

  selectedInvestment = signal<UserInvestment | null>(null);
  showManageModal = signal(false);
  isProcessing = signal(false);

  // Partial Sell State
  selectedHolding = signal<InstrumentHolding | null>(null);
  sellUnits = signal<number>(0);

  ngOnInit() {
    // Already loaded by service constructor initially, but good to ensure
  }

  manageInvestment(invest: UserInvestment) {
    this.selectedInvestment.set(invest);
    this.showManageModal.set(true);
    this.selectedHolding.set(null);
  }

  closeModal() {
    this.showManageModal.set(false);
  }

  handleExitAll() {
    if (!this.selectedInvestment()) return;

    Swal.fire({
      title: 'Exit Portfolio?',
      text: `Are you sure you want to sell all instruments in ${this.selectedInvestment()!.portfolioName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#1B4332',
      confirmButtonText: 'Yes, Exit All',
      background: '#f8f7f2',
      customClass: { popup: 'rounded-[30px]' }
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.isProcessing.set(true);
        this.investmentService.exitPortfolio(this.selectedInvestment()!.id).subscribe({
          next: () => {
            this.isProcessing.set(false);
            this.closeModal();
            Swal.fire('Exited!', 'Your funds have been returned to your wallet.', 'success');
          },
          error: () => this.isProcessing.set(false)
        });
      }
    });
  }

  handleLiquidateAll() {
    if (this.userInvestments().length === 0) return;

    Swal.fire({
      title: 'Liquidate All?',
      text: 'This will sell all instruments in all active portfolios. This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#1B4332',
      confirmButtonText: 'Yes, Sell Everything',
      background: '#f8f7f2',
      customClass: { popup: 'rounded-[30px]' }
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.isProcessing.set(true);
        this.investmentService.liquidateEverything().subscribe({
          next: () => {
            this.isProcessing.set(false);
            Swal.fire('Liquidated!', 'All your investments have been converted to cash.', 'success');
          },
          error: () => this.isProcessing.set(false)
        });
      }
    });
  }

  selectHoldingForSell(holding: InstrumentHolding) {
    this.selectedHolding.set(holding);
    this.sellUnits.set(0);
  }

  confirmPartialSell() {
    if (!this.selectedInvestment() || !this.selectedHolding() || this.sellUnits() <= 0) return;
    if (this.sellUnits() > this.selectedHolding()!.units) return;

    this.isProcessing.set(true);
    this.investmentService.sellInstrumentUnits(
        this.selectedInvestment()!.id, 
        this.selectedHolding()!.id, 
        this.sellUnits()
    ).subscribe({
      next: () => {
        this.isProcessing.set(false);
        this.selectedHolding.set(null);
        Swal.fire('Sold!', 'Instrument units sold successfully.', 'success');
      },
      error: () => this.isProcessing.set(false)
    });
  }
}
