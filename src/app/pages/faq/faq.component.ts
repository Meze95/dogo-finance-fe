import { Component, signal } from '@angular/core';
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
  // Using Signals for state management (Simulating CMS data)
  categories = signal<FAQCategory[]>(FAQ_DATA);

  toggleCategory(index: number) {
    this.categories.update(cats => {
      const newCats = [...cats];
      newCats[index] = { ...newCats[index], isOpen: !newCats[index].isOpen };
      return newCats;
    });
  }

  toggleQuestion(catIndex: number, qIndex: number) {
    this.categories.update(cats => {
      const newCats = [...cats];
      const category = { ...newCats[catIndex] };
      const questions = [...category.questions];
      questions[qIndex] = { ...questions[qIndex], isOpen: !questions[qIndex].isOpen };
      category.questions = questions;
      newCats[catIndex] = category;
      return newCats;
    });
  }
}
