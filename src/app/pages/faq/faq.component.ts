import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FAQCategory {
  title: string;
  isOpen: boolean;
  questions: {
    q: string;
    a: string;
    isOpen: boolean;
  }[];
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- FAQ Hero Section (Deep Navy) -->
    <section class="bg-[#051121] text-white pt-24 pb-20 relative overflow-hidden">
      <!-- Background Accents -->
      <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
      
      <div class="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div class="flex flex-col lg:flex-row items-center justify-between gap-16">
          <div class="lg:w-1/2">
            <h1 class="text-6xl md:text-[80px] font-[900] leading-[1] mb-8 tracking-tighter">
              Ways we <br>
              can <span class="text-blue-500 italic">help.</span>
            </h1>
            <p class="text-xl text-gray-400 font-medium max-w-lg leading-relaxed">
              Find answers to your questions about DogoFinance, or reach out to our support team for specialized assistance.
            </p>
          </div>
          <div class="lg:w-1/2 w-full max-w-xl">
             <div class="relative group">
               <input type="text" placeholder="Search for a question..." class="w-full h-16 md:h-20 bg-white/5 border-2 border-white/10 rounded-full px-10 text-xl font-medium focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all placeholder:text-gray-500">
               <i class="ri-search-line absolute right-8 top-1/2 -translate-y-1/2 text-2xl text-gray-500 group-focus-within:text-blue-500 transition-colors"></i>
             </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Content Section -->
    <section class="py-24 bg-[#fbfbfc]">
      <div class="max-w-4xl mx-auto px-6 md:px-12">
        <!-- Categories Accordion List -->
        <div class="space-y-6">
          <div *ngFor="let cat of categories; let i = index" class="group">
             <!-- Category Header -->
             <button (click)="toggleCategory(i)" class="w-full flex items-center justify-between p-8 md:p-10 bg-[#0d1b2a] text-white rounded-[32px] hover:bg-[#16293d] transition-all shadow-xl shadow-gray-200">
               <span class="text-xl md:text-2xl font-black uppercase tracking-widest text-left">{{cat.title}}</span>
               <i class="ri-arrow-down-s-line text-3xl transition-transform duration-500" [class.rotate-180]="cat.isOpen"></i>
             </button>

             <!-- Questions Sub-list -->
             <div class="overflow-hidden transition-all duration-500 ease-in-out" [style.max-height]="cat.isOpen ? '2000px' : '0'" [class.mt-4]="cat.isOpen">
                <div class="space-y-4 px-2 md:px-8 pb-4">
                  <div *ngFor="let item of cat.questions; let j = index" class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <button (click)="toggleQuestion(i, j)" class="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors">
                      <span class="font-bold text-[#0d1b2a] pr-4">{{item.q}}</span>
                      <i class="ri-add-line text-2xl text-blue-500 transition-transform duration-300" [class.rotate-45]="item.isOpen"></i>
                    </button>
                    <div class="overflow-hidden transition-all duration-300 ease-in-out" [style.max-height]="item.isOpen ? '500px' : '0'">
                      <p class="px-6 pb-6 text-gray-500 font-medium leading-relaxed border-t border-gray-50 pt-4">
                        {{item.a}}
                      </p>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </div>

        <!-- Support CTA -->
        <div class="mt-24 p-12 rounded-[50px] bg-blue-600 text-white text-center relative overflow-hidden group">
           <div class="absolute inset-0 bg-blue-700 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
           <div class="relative z-10">
             <h3 class="text-3xl font-black mb-6">Still have questions?</h3>
             <p class="text-xl text-blue-100 mb-10 max-w-xl mx-auto font-medium">Our support team is always here to help you via live chat, email, or phone call.</p>
             <button class="px-10 py-4 bg-white text-blue-600 rounded-2xl font-black hover:scale-105 transition-all shadow-2xl">
               Contact Support
             </button>
           </div>
        </div>
      </div>
    </section>

    <!-- FAQ Footer Links -->
    <div class="bg-white py-12 border-t border-gray-50">
      <div class="max-w-7xl mx-auto px-6 md:px-12 flex flex-wrap justify-center items-center gap-12 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
          <span class="text-xl font-black tracking-tighter italic">DogoFinance Support</span>
          <span class="text-xl font-black tracking-tighter">Community Docs</span>
          <span class="text-xl font-black tracking-tighter">API Reference</span>
          <span class="text-xl font-black tracking-tighter">Privacy Hub</span>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      background-color: #ffffff;
    }
  `]
})
export class FAQComponent {
  categories: FAQCategory[] = [
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

  toggleCategory(index: number) {
    this.categories[index].isOpen = !this.categories[index].isOpen;
  }

  toggleQuestion(catIndex: number, qIndex: number) {
    this.categories[catIndex].questions[qIndex].isOpen = !this.categories[catIndex].questions[qIndex].isOpen;
  }
}
