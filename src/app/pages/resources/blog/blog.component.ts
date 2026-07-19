import { Component, signal, computed, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css'
})
export class BlogComponent implements AfterViewInit {

  posts = signal([
    {
      id: 'what-is-riba',
      title: 'What is Riba? And Why DOGO Was Built to Eliminate It',
      excerpt: 'Conventional banking relies on interest, which is strictly prohibited in Islam. Here is a breakdown of why Riba is harmful and how Halal finance offers a better path.',
      category: 'Halal Finance 101',
      date: 'March 20, 2026',
      readTime: '5 min read',
      author: 'Dogo Editorial',
      image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80'
    },
    {
      id: '5-halal-products',
      title: '5 Halal Investment Products Every Nigerian Muslim Needs to Know',
      excerpt: 'From Mudarabah to Sukuk, discover the array of Shariah-compliant investment vehicles now available to Nigerian retail investors.',
      category: 'Investing',
      date: 'March 15, 2026',
      readTime: '7 min read',
      author: 'Mustapha K.',
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80'
    },
    {
      id: 'how-bvn-nin-protects',
      title: 'How Our BVN/NIN KYC Protects Your Identity & Wealth',
      excerpt: 'Learn how DOGO integrates securely with NIBSS and NIMC to ensure your assets and data are protected by world-class security.',
      category: 'Security',
      date: 'March 12, 2026',
      readTime: '4 min read',
      author: 'Security Team',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80'
    },
    {
      id: 'beginners-guide-sukuk',
      title: 'A Beginner\'s Guide to Sukuk in Nigeria',
      excerpt: 'What are Islamic bonds? How do they differ from conventional bonds? This guide breaks down the Sukuk marketplace for retail investors.',
      category: 'Investing',
      date: 'March 05, 2026',
      readTime: '6 min read',
      author: 'Aisha F.',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80'
    },
    {
      id: 'calculating-zakat-2026',
      title: 'Calculating Your Zakat in 2026: A Step-by-Step Naira Guide',
      excerpt: 'Understanding the Nisab threshold based on gold prices and accurately determining your Zakat obligation in Nigerian Naira.',
      category: 'Wealth Management',
      date: 'February 28, 2026',
      readTime: '8 min read',
      author: 'SSB Advisory',
      image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&q=80'
    },
    {
      id: 'understanding-musharakah',
      title: 'Musharakah Explained: Sharing The Risk and The Reward',
      excerpt: 'A deep dive into joint venture investments where both profit and loss are shared proportionally.',
      category: 'Halal Finance 101',
      date: 'February 20, 2026',
      readTime: '5 min read',
      author: 'Dogo Editorial',
      image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80'
    }
  ]);

  categories = ['All', 'Halal Finance 101', 'Investing', 'Security', 'Wealth Management'];
  selectedCategory = signal('All');

  filteredPosts = computed(() => {
    if (this.selectedCategory() === 'All') return this.posts();
    return this.posts().filter(p => p.category === this.selectedCategory());
  });

  setCategory(cat: string) {
    this.selectedCategory.set(cat);
    // Re-init animations on category change to animate filtered items
    setTimeout(() => this.initScrollAnimations(), 50);
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
