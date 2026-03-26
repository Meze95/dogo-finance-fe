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
    title: "What is DogoFinance?",
    isOpen: true,
    questions: [
      {
        q: "What is DogoFinance?",
        a: "DogoFinance is a simple and reliable online savings and investment platform that helps you save and invest with ease. We provide diverse plans to help you reach your financial goals.",
        isOpen: false
      },
      {
        q: "Is DogoFinance secure?",
        a: "Yes, security is our priority. We use 256-bit SSL encryption and bank-grade security protocols to ensure your data and funds are always protected.",
        isOpen: false
      }
    ]
  },
  {
    title: "Savings & Safety",
    isOpen: false,
    questions: [
      {
        q: "How safe is my money?",
        a: "Your funds are stored with our licensed partner banks and investment houses. DogoFinance itself is built on top of high-security infrastructure.",
        isOpen: false
      },
      {
        q: "What interest rate can I expect?",
        a: "Our rates vary from 10% to 15.5% per annum depending on the plan you choose, such as SafeLock or Target Savings.",
        isOpen: false
      }
    ]
  },
  {
    title: "Investify",
    isOpen: false,
    questions: [
      {
        q: "What is Investify?",
        a: "Investify is a feature on DogoFinance that allows you to invest in low-to-medium risk opportunities such as Real Estate, Agriculture, and Transportation for higher returns.",
        isOpen: false
      },
      {
        q: "What is the minimum investment amount?",
        a: "You can start investing with as little as ₦5,000 on most of our opportunities.",
        isOpen: false
      }
    ]
  },
  {
    title: "BVN & Bank Account",
    isOpen: false,
    questions: [
      {
        q: "Why do I need to provide my BVN?",
        a: "The Bank Verification Number (BVN) is required by regulatory agencies to verify your identity and prevent fraud. DogoFinance does not have access to your bank balance or secondary information via BVN.",
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
