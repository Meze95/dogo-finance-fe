import { Component, OnInit, signal, computed, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './blog-detail.component.html',
  styleUrl: './blog-detail.component.css'
})
export class BlogDetailComponent implements OnInit, AfterViewInit {
  private route = inject(ActivatedRoute);

  allPosts = [
    {
      id: 'what-is-riba',
      title: 'What is Riba? And Why DOGO Finance Was Built to Eliminate It',
      category: 'Halal Finance 101',
      date: 'March 20, 2026',
      readTime: '5 min read',
      author: 'Dogo Editorial',
      image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80',
      content: `
        <h2 class="text-3xl font-black text-[var(--dogo-dark)] mb-6">Understanding Riba in Islamic Finance</h2>
        <p class="mb-6 text-[var(--dogo-muted)] leading-relaxed text-lg">
           Riba, commonly translated as interest or usury, is unconditionally prohibited in Islam. Conventional banking systems are built fundamentally on the principle of lending money for a guaranteed, risk-free return—interest. But why is this harmful?
        </p>
        <p class="mb-6 text-[var(--dogo-muted)] leading-relaxed text-lg">
           In Islamic finance, money is seen purely as a medium of exchange, not a commodity that can be bought or sold for profit on its own. Wealth must be generated from legitimate trade, asset-backed investments, or joint ventures where risk is shared.
        </p>
        <blockquote class="border-l-4 border-[var(--dogo-primary)] pl-6 my-10 italic text-2xl text-[var(--dogo-primary)] font-medium leading-tight">
           "Our mission at DOGO Finance is not just to offer an alternative, but to build a robust, transparent, and profitable Halal ecosystem for every Nigerian."
        </blockquote>
        <h3 class="text-2xl font-black text-[var(--dogo-dark)] mb-4">How Dogo Finance Operates Riba-Free</h3>
        <p class="mb-6 text-[var(--dogo-muted)] leading-relaxed text-lg">
           Instead of interest-bearing accounts, DOGO Finance uses established Shariah structures like <strong>Mudarabah</strong> (profit-sharing) and <strong>Wakala</strong> (agency contracts). When you deposit funds with us, you are not lending us money; you are capital providers (Rabb-ul-Mal) entering a partnership where profits are shared.
        </p>
      `
    },
    {
      id: '5-halal-products',
      title: '5 Halal Investment Products Every Nigerian Muslim Needs to Know',
      category: 'Investing',
      date: 'March 15, 2026',
      readTime: '7 min read',
      author: 'Mustapha K.',
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
      content: `
        <p class="mb-6 text-[var(--dogo-muted)] leading-relaxed text-lg">
           Nigerian Muslims have historically had limited access to fully compliant investment vehicles. That is changing. Here are the 5 essential products available on the DOGO Finance platform today:
        </p>
        <h3 class="text-2xl font-black text-[var(--dogo-dark)] mb-4">1. Mudarabah (Profit-Sharing)</h3>
        <p class="mb-6 text-[var(--dogo-muted)] leading-relaxed text-lg">The cornerstone of Halal investing. You provide the capital, DOGO Finance manages it. Profits are shared 70/30.</p>
        
        <h3 class="text-2xl font-black text-[var(--dogo-dark)] mb-4">2. Sukuk (Islamic Bonds)</h3>
        <p class="mb-6 text-[var(--dogo-muted)] leading-relaxed text-lg">Unlike conventional bonds which are debt instruments, Sukuk represent ownership in a tangible asset.</p>
        
        <h3 class="text-2xl font-black text-[var(--dogo-dark)] mb-4">3. Halal Equities</h3>
        <p class="mb-6 text-[var(--dogo-muted)] leading-relaxed text-lg">Invest in listed stocks that have been fully screened to exclude Haram sectors like alcohol and conventional banking.</p>
      `
    },
    {
      id: 'how-bvn-nin-protects',
      title: 'How Our BVN/NIN KYC Protects Your Identity & Wealth',
      category: 'Security',
      date: 'March 12, 2026',
      readTime: '4 min read',
      author: 'Security Team',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80',
      content: `
        <p class="mb-6 text-[var(--dogo-muted)] leading-relaxed text-lg">
           Security is uncompromising at Dogo Finance. By deeply integrating with Nigeria's NIBSS (for BVN) and NIMC (for NIN), we ensure every account on our platform belongs to a verified individual.
        </p>
        <p class="mb-6 text-[var(--dogo-muted)] leading-relaxed text-lg">
           This strict adherence to NDPR and CBN KYC regulations ensures that our entire ecosystem remains safe, fraud-free, and transparent.
        </p>
      `
    },
    {
      id: 'beginners-guide-sukuk',
      title: 'A Beginner\'s Guide to Sukuk in Nigeria',
      category: 'Investing',
      date: 'March 05, 2026',
      readTime: '6 min read',
      author: 'Aisha F.',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80',
      content: `
        <p class="mb-6 text-[var(--dogo-muted)] leading-relaxed text-lg">
           Sukuk translates to "certificates". While commonly referred to as Islamic bonds, they are fundamentally different. A conventional bond is a promise to repay a loan with interest. A Sukuk is a certificate representing partial ownership in an eligible, Halal asset.
        </p>
      `
    },
    {
      id: 'calculating-zakat-2026',
      title: 'Calculating Your Zakat in 2026: A Step-by-Step Naira Guide',
      category: 'Wealth Management',
      date: 'February 28, 2026',
      readTime: '8 min read',
      author: 'SSB Advisory',
      image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&q=80',
      content: `
        <p class="mb-6 text-[var(--dogo-muted)] leading-relaxed text-lg">
           Zakat is mandatory (Fard) on every adult Muslim possessing wealth above the Nisab threshold for a full lunar year. In 2026, with gold prices fluctuating, determining the Naira equivalent of 87.48 grams of gold is critical.
        </p>
      `
    },
    {
      id: 'understanding-musharakah',
      title: 'Musharakah Explained: Sharing The Risk and The Reward',
      category: 'Halal Finance 101',
      date: 'February 20, 2026',
      readTime: '5 min read',
      author: 'Dogo Editorial',
      image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80',
      content: `
        <p class="mb-6 text-[var(--dogo-muted)] leading-relaxed text-lg">
           Musharakah is pure partnership. Unlike Mudarabah where one party provides solely capital and the other solely labor, Musharakah allows both parties to provide capital.
        </p>
      `
    }
  ];

  postId = signal<string>('');

  post = computed(() => {
    return this.allPosts.find(p => p.id === this.postId()) || null;
  });

  relatedPosts = computed(() => {
    const currentCategory = this.post()?.category;
    if (!currentCategory) return [];
    return this.allPosts
      .filter(p => p.category === currentCategory && p.id !== this.postId())
      .slice(0, 3);
  });

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.postId.set(params['id']);
      window.scrollTo(0, 0);
      // Re-init animations on route change to detail post
      setTimeout(() => this.initScrollAnimations(), 50);
    });
  }

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

