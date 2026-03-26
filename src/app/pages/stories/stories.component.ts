import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Story {
  name: string;
  photo: string;
  content: string;
  date: string;
  product?: string;
}

@Component({
  selector: 'app-stories',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Hero Section (Royal Blue Theme) -->
    <section class="bg-[#0d60d8] text-white pt-24 pb-20 relative overflow-hidden">
      <!-- Decorative Elements -->
      <div class="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div class="absolute bottom-0 left-10 w-48 h-48 bg-green-400/10 rounded-full blur-3xl translate-y-1/2"></div>
      
      <div class="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <!-- Text Content -->
          <div class="animate-fade-in">
            <h1 class="text-6xl md:text-[80px] font-[900] leading-[1] mb-8 tracking-tighter shadow-blue-900/20">
              Loved by our <br>
              <span class="text-blue-200 uppercase italic">Customers.</span>
            </h1>
            <p class="text-xl text-blue-50 mb-12 max-w-lg leading-relaxed font-medium opacity-90">
              Over 6 million people are building their financial future with DogoFinance. Read how real people are achieving their goals every day.
            </p>
            <div class="flex items-center space-x-4">
               <div class="flex -space-x-4">
                 <img src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=100" class="w-12 h-12 rounded-full border-4 border-[#0d60d8]">
                 <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100" class="w-12 h-12 rounded-full border-4 border-[#0d60d8]">
                 <img src="https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&q=80&w=100" class="w-12 h-12 rounded-full border-4 border-[#0d60d8]">
                 <div class="w-12 h-12 rounded-full bg-blue-400 border-4 border-[#0d60d8] flex items-center justify-center text-xs font-black">6M+</div>
               </div>
               <span class="font-bold text-sm tracking-widest uppercase text-blue-100">Verified Success Stories</span>
            </div>
          </div>

          <!-- Hero Visual (Polaroid Collage) -->
          <div class="relative flex justify-center lg:justify-end">
             <div class="relative w-full max-w-md aspect-square bg-white/5 backdrop-blur-sm rounded-[40px] border border-white/10 p-4">
               <img src="/images/stories-hero.png" alt="Stories Collage" class="w-full h-full object-cover rounded-[32px] shadow-2xl">
               <!-- Floating elements -->
               <div class="absolute -right-8 top-1/2 p-4 bg-white rounded-2xl shadow-2xl animate-bounce hidden md:block">
                 <i class="ri-checkbox-circle-fill text-green-500 text-3xl"></i>
               </div>
             </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Success Stories Feed -->
    <section class="py-24 bg-[#fbfbfc]">
      <div class="max-w-7xl mx-auto px-6 md:px-12">
        <!-- Feed Title -->
        <div class="flex items-center justify-between mb-16 border-b border-gray-200 pb-8">
           <h2 class="text-2xl font-[900] text-[#0d1b2a] tracking-tight uppercase">Recent Success Stories</h2>
           <span class="text-sm font-bold text-gray-400 uppercase tracking-widest">Showing {{stories.length}} Stories</span>
        </div>

        <!-- Stories Grid -->
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div *ngFor="let story of stories" class="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div class="flex items-center space-x-4 mb-6">
              <div class="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-50 shadow-sm">
                 <img [src]="story.photo" [alt]="story.name" class="w-full h-full object-cover">
              </div>
              <div class="flex-grow">
                <p class="font-black text-[#0d1b2a] leading-tight">{{story.name}}</p>
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{story.date}}</p>
              </div>
              <div class="text-green-500 text-sm font-black flex items-center space-x-1">
                <i class="ri-shield-check-fill"></i>
                <span class="text-[10px] uppercase tracking-tighter">Verified</span>
              </div>
            </div>
            
            <p class="text-gray-600 font-medium leading-relaxed italic relative mb-8">
              "{{story.content}}"
            </p>

            <div *ngIf="story.product" class="pt-6 border-t border-gray-50 flex items-center justify-between">
              <span class="text-[10px] font-black uppercase text-gray-400 tracking-widest">Saving via</span>
              <span class="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">{{story.product}}</span>
            </div>
          </div>
        </div>

        <!-- Load More Button -->
        <div class="mt-20 text-center">
           <button class="px-12 py-5 bg-[#0d1b2a] text-white rounded-2xl font-black text-lg hover:bg-gray-800 transition-all hover:scale-105 shadow-xl shadow-gray-200 uppercase tracking-widest">
             Share your story
           </button>
        </div>
      </div>
    </section>

    <!-- As featured in -->
    <div class="bg-white py-12 border-t border-gray-50">
      <div class="max-w-7xl mx-auto px-6 md:px-12 flex flex-wrap justify-center items-center gap-12 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
          <span class="text-xl font-black tracking-tighter">techcabal</span>
          <span class="text-xl font-black tracking-tighter">CNBC</span>
          <span class="text-xl font-black tracking-tighter">TechCrunch</span>
          <span class="text-xl font-black tracking-tighter">PYMNTS</span>
          <span class="text-xl font-black tracking-tighter">Fast Company</span>
          <span class="text-xl font-black tracking-tighter">CIO</span>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      background-color: #ffffff;
    }

    @keyframes fade-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .animate-fade-in {
      animation: fade-in 1s ease-out forwards;
    }
  `]
})
export class StoriesComponent {
  stories: Story[] = [
    {
      name: "Tunde Williams",
      date: "Monday, 24th of March 2026",
      photo: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&q=80&w=150",
      content: "I started using DogoFinance last year to save for my wedding. The Safelock feature kept me disciplined and I was able to hit my goal 2 months early! The interest was a lovely bonus.",
      product: "Safelock"
    },
    {
      name: "Chioma Okereke",
      date: "Sunday, 23rd of March 2026",
      photo: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=150",
      content: "As a small business owner, managing cashflow was hard. DogoFinance helped me automate my savings every morning. Now I have enough to restock without taking loans.",
      product: "Piggybank"
    },
    {
      name: "Bolaji Jenkins",
      date: "Friday, 21st of March 2026",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
      content: "The Investify opportunities are real. I've earned over 20% in returns on the real estate projects. My money works while I sleep.",
      product: "Investify"
    },
    {
      name: "Aisha Mohammed",
      date: "Thursday, 20th of March 2026",
      photo: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=150",
      content: "Target savings made it possible for me to buy my first car. Seeing the progress bar move every week was the motivation I needed. DogoFinance is the best!",
      product: "Target Savings"
    },
    {
      name: "Samuel Etim",
      date: "Wednesday, 19th of March 2026",
      photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
      content: "Flex Dollar has been my hedge against inflation. Saving in USD was so easy and the interface is super clean. I recommend this to everyone.",
      product: "Flex Dollar"
    },
    {
      name: "Funmilayo Adeboye",
      date: "Tuesday, 18th of March 2026",
      photo: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&q=80&w=150",
      content: "I saved for my kids' school fees using House Money. It took the pressure off my monthly income and gave me peace of mind. Truly a game changer.",
      product: "House Money"
    }
  ];
}
