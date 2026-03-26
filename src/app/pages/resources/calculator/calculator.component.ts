import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calculator.component.html',
  styleUrl: './calculator.component.css'
})
export class CalculatorComponent {
  // Inputs as signals
  initialAmount = signal<number>(50000);
  monthlyAmount = signal<number>(10000);
  durationYears = signal<number>(5);
  profitRate = signal<number>(18); // Halal profit rate (e.g., Mudarabah)

  // Computed results
  results = computed(() => {
    const P = this.initialAmount();
    const PMT = this.monthlyAmount();
    const t = this.durationYears();
    const r = this.profitRate() / 100 / 12; // Monthly profit share rate
    const n = t * 12; // Total months

    // Future Value Formula for compound profit + regular additions
    // FV = P(1+r)^n + PMT * [((1+r)^n - 1) / r]
    let fv = 0;
    if (r === 0) {
      fv = P + (PMT * n);
    } else {
      const pExp = Math.pow(1 + r, n);
      fv = (P * pExp) + (PMT * ((pExp - 1) / r));
    }

    const totalInvested = P + (PMT * n);
    const totalProfit = fv - totalInvested;

    return {
      totalSavings: fv,
      totalInvested: totalInvested,
      totalProfit: totalProfit,
      growthFactor: fv / totalInvested
    };
  });

  // Event handlers to update signals
  updateInitial(e: any) { this.initialAmount.set(Number(e.target.value)); }
  updateMonthly(e: any) { this.monthlyAmount.set(Number(e.target.value)); }
  updateDuration(e: any) { this.durationYears.set(Number(e.target.value)); }
  updateRate(e: any) { this.profitRate.set(Number(e.target.value)); }
}
