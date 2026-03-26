import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Ebook {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  downloadUrl: string;
}

const EBOOKS_DATA: Ebook[] = [
  {
    id: '1',
    title: 'The Halal Wealth Blueprint',
    description: 'A step-by-step guide to building lasting wealth while adhering strictly to Islamic principles.',
    category: 'Wealth Management',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
    downloadUrl: '#'
  },
  {
    id: '2',
    title: 'Understanding Zakat in Naira',
    description: 'A comprehensive handbook for calculating your Nisab, identifying Zakat-eligible assets, and purifying your wealth.',
    category: 'Personal Finance',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800',
    downloadUrl: '#'
  },
  {
    id: '3',
    title: 'Sukuk & Mudarabah Explained',
    description: 'Demystifying the world of Islamic bonds and profit-sharing contracts for the first-time Nigerian investor.',
    category: 'Investing',
    image: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80&w=800',
    downloadUrl: '#'
  }
];

@Component({
  selector: 'app-ebook',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ebook.component.html',
  styleUrl: './ebook.component.css'
})
export class EbookComponent {
  ebooks = signal<Ebook[]>(EBOOKS_DATA);
}
