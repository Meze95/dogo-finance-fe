import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../shared/services/product.service';
import { InvestmentService } from '../../../shared/services/investment.service';
import { Product, ProductAssetAllocation } from '../../../shared/models/product.model';

import { AlertService } from '../../../shared/services/alert.service';

declare var Swal: any;

@Component({
  selector: 'app-client-portfolios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './portfolios.component.html',
  styleUrl: './portfolios.component.css'
})
export class ClientPortfoliosComponent implements OnInit {
  private productService = inject(ProductService);
  private investmentService = inject(InvestmentService);
  private alertService = inject(AlertService);

  portfolios = this.productService.portfolios;
  activeFilter = signal<string>('All');
  
  activePortfolios = computed(() => {
    const all = this.portfolios().filter(p => p.isActive);
    const filter = this.activeFilter();
    if (filter === 'All') return all;
    return all.filter(p => p.riskLevel === filter);
  });

  selectedPortfolio = signal<Product | null>(null);
  showDetailModal = signal(false);

  // Investment State
  showInvestModal = signal(false);
  investAmount = signal<number>(100000);
  isProcessing = signal(false);

  ngOnInit() {
    this.productService.getPortfolios();
  }

  viewDetail(portfolio: Product) {
    this.selectedPortfolio.set(portfolio);
    this.showDetailModal.set(true);
  }

  closeModal() {
    this.showDetailModal.set(false);
    this.showInvestModal.set(false);
  }

  openInvestModal() {
    this.showDetailModal.set(false);
    this.showInvestModal.set(true);
  }

  confirmInvestment() {
    if (!this.selectedPortfolio() || this.investAmount() <= 0) return;

    this.isProcessing.set(true);
    this.investmentService.invest(this.selectedPortfolio()!.portfolioId, this.investAmount()).subscribe({
      next: (res) => {
        this.isProcessing.set(false);
        this.closeModal();
        Swal.fire({
          icon: 'success',
          title: 'Investment Successful',
          text: `You have successfully invested ₦${this.investAmount().toLocaleString()} in ${this.selectedPortfolio()!.name}`,
          confirmButtonColor: '#1B4332',
          customClass: { popup: 'rounded-[30px]' }
        });
      },
      error: () => this.isProcessing.set(false)
    });
  }

  getAssetColor(index: number): string {
    const colors = ['bg-[#1B4332]', 'bg-[#C9A84C]', 'bg-[#2D6A4F]', 'bg-[#0d1a0f]', 'bg-[#40916c]'];
    return colors[index % colors.length];
  }

  getAssetTextColor(index: number): string {
    const colors = ['text-[#1B4332]', 'text-[#C9A84C]', 'text-[#2D6A4F]', 'text-[#0d1a0f]', 'text-[#40916c]'];
    return colors[index % colors.length];
  }
}
