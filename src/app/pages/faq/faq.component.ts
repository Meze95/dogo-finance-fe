import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FAQItem {
  q: string;
  a: string;
  isOpen: boolean;
}

interface FAQCategory {
  title: string;
  isOpen: boolean;
  questions: FAQItem[];
}

const FAQ_DATA: FAQCategory[] = [
  {
    title: "About DOGO Finance",
    isOpen: true,
    questions: [
      {
        q: "What is DOGO Finance?",
        a: "DOGO Finance is a premium, Shariah-compliant digital investment banking platform. We provide Nigerian investors with 100% Halal wealth management products, entirely free of Riba (interest).",
        isOpen: false
      },
      {
        q: "How to know it is truly Halal?",
        a: "Every product, from Mudarabah to Halal Equities, is certified by our independent Shariah Supervisory Board (SSB). We do not deal in interest, speculative trading (Gharar), or haram industries.",
        isOpen: false
      }
    ]
  },
  {
    title: "Investments & Profit",
    isOpen: false,
    questions: [
      {
        q: "How is profit calculated instead of interest?",
        a: "Unlike conventional interest (which guarantees a return regardless of business outcome), Halal profit is generated from real economic activity. Depending on the product, you either share profits at a pre-agreed ratio (Mudarabah) or earn from genuine asset leases (Ijarah).",
        isOpen: false
      },
      {
        q: "What happens if there's a loss?",
        a: "In Islamic finance, risk and reward are shared. If an investment incurs a genuine loss through market conditions, it is shared proportionately. However, DOGO Finance strictly vets all assets to minimize risk and protect capital.",
        isOpen: false
      }
    ]
  },
  {
    title: "Products",
    isOpen: false,
    questions: [
      {
        q: "What is the difference between Sukuk and Halal Equity?",
        a: "Sukuk represents ownership in a tangible asset (like real estate) that pays a stable return. Halal Equity means buying shares in Shariah-compliant companies, where returns are based on stock market performance.",
        isOpen: false
      },
      {
        q: "What is the minimum investment?",
        a: "You can open a Halal investment position starting from ₦10,000 for Mudarabah accounts, easily funded via your secure Dogo Finance wallet.",
        isOpen: false
      }
    ]
  },
  {
    title: "Security & Verification",
    isOpen: false,
    questions: [
      {
        q: "Why do I need to provide my BVN & NIN?",
        a: "To protect the ecosystem and comply with CBN anti-money laundering regulations, we verify the identity of all investors. This data is heavily encrypted and compliant with NDPR.",
        isOpen: false
      }
    ]
  }
];

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.css'
})
export class FAQComponent {
  // Original state from CMS
  private _categories = signal<FAQCategory[]>(FAQ_DATA);
  
  // Search query signal
  searchQuery = signal<string>('');

  // Computed signal for filtered results
  filteredCategories = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this._categories();

    return this._categories().map(cat => {
      // Filter questions in this category that match the query
      const matchingQuestions = cat.questions.filter(q => 
        q.q.toLowerCase().includes(query) || 
        q.a.toLowerCase().includes(query)
      );

      // If category title matches or has matching questions, return it
      if (cat.title.toLowerCase().includes(query) || matchingQuestions.length > 0) {
        return {
          ...cat,
          isOpen: query !== '' ? true : cat.isOpen, // Auto-expand if searching
          questions: matchingQuestions.length > 0 ? matchingQuestions : cat.questions
        };
      }
      return null;
    }).filter((cat): cat is FAQCategory => cat !== null);
  });

  updateSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  toggleCategory(title: string) {
    this._categories.update(cats => {
      return cats.map(cat => 
        cat.title === title ? { ...cat, isOpen: !cat.isOpen } : cat
      );
    });
  }

  toggleQuestion(catTitle: string, questionText: string) {
    this._categories.update(cats => {
      return cats.map(cat => {
        if (cat.title === catTitle) {
          return {
            ...cat,
            questions: cat.questions.map(q => 
              q.q === questionText ? { ...q, isOpen: !q.isOpen } : q
            )
          };
        }
        return cat;
      });
    });
  }
}
