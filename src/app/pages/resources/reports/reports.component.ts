import { Component, signal, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ReportYear {
  year: string;
  title: string;
  summary: string;
  image: string;
}

const REPORTS_DATA: ReportYear[] = [
  {
    year: '2026',
    title: 'Q1 Halal Fund Performance',
    summary: 'A detailed review of our Mudarabah and Sukuk portfolios, outlining actual returns versus expected profit.',
    image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800'
  },
  {
    year: '2025',
    title: 'Annual Shariah Compliance Report',
    summary: 'The comprehensive audit signed off by our SSB confirming zero Riba exposure across all DOGO assets.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800'
  },
  {
    year: '2024',
    title: 'Maiden Investment Impact',
    summary: 'Detailing how our pooled Musharakah funds backed 50 Halal SMEs across Northern Nigeria.',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800'
  }
];

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements AfterViewInit {
  reports = signal<ReportYear[]>(REPORTS_DATA);

  ngAfterViewInit(): void {
    this.initScrollAnimations();
  }

  private initScrollAnimations(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('scroll-animate-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll(
      '.scroll-animate, .scroll-animate-left, .scroll-animate-right'
    ).forEach((el) => observer.observe(el));
  }
}
