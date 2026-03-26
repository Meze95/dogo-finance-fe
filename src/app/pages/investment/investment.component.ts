import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-investment',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Hero Section (Premium Dark Theme) -->
    <section class="bg-[#051121] text-white pt-24 pb-16 relative overflow-hidden">
      <!-- Background Glowing Shapes -->
      <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
      <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
      
      <div class="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <!-- Text Content -->
          <div>
            <div class="inline-flex items-center space-x-2 bg-purple-600/20 text-purple-400 px-4 py-2 rounded-full text-sm font-bold mb-8 border border-purple-600/30 animate-fade-in">
              <i class="ri-flashlight-fill"></i>
              <span>High Yield Opportunities</span>
            </div>
            <h1 class="text-6xl md:text-[85px] font-[900] leading-[0.95] mb-8 tracking-tighter">
              Simplified <br>
              <span class="text-purple-500">Investments</span> <br>
              with great returns.
            </h1>
            <p class="text-xl text-gray-400 mb-12 max-w-lg leading-relaxed font-medium">
              Join millions of people using DogoFinance to invest in vetted, high-yield opportunities. Grow your wealth safely and at your own pace.
            </p>
            
            <div class="flex flex-wrap gap-4">
              <button class="flex items-center space-x-3 bg-purple-600 text-white px-10 py-5 rounded-2xl font-black hover:bg-purple-700 transition-all shadow-2xl shadow-purple-500/30 hover:-translate-y-1">
                <i class="ri-rocket-fill text-xl"></i>
                <span>Start Investing</span>
              </button>
            </div>
          </div>

          <!-- Hero Visual (Premium Mockup) -->
          <div class="relative flex justify-center lg:justify-end">
            <div class="relative z-10 w-full max-w-lg p-4">
              <div class="bg-white/5 backdrop-blur-3xl rounded-[40px] p-6 shadow-[0_50px_100px_rgba(0,0,0,0.5)] border border-white/10 relative">
                 <!-- Returns Badge -->
                <div class="absolute -right-8 -top-8 bg-purple-600 p-6 rounded-3xl shadow-2xl animate-bounce">
                  <p class="text-[10px] uppercase font-bold text-purple-200">Returns up to</p>
                  <p class="text-3xl font-black">25% p.a.</p>
                </div>
                
                <div class="rounded-[32px] overflow-hidden relative aspect-[4/5] bg-[#0d1b2a]">
                  <img src="/images/invest-hero.png" alt="Investment Dashboard" class="w-full h-full object-cover">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Investment Categories -->
    <section class="py-24 bg-white">
      <div class="max-w-7xl mx-auto px-6 md:px-12">
        <div class="text-center max-w-3xl mx-auto mb-20">
          <h2 class="text-4xl md:text-5xl font-black text-[#0d1b2a] mb-6 tracking-tight">Vetted opportunities in diverse sectors.</h2>
          <p class="text-xl text-gray-500 font-medium leading-relaxed">We partner with only the best and licensed investment houses to bring you pre-vetted, low-to-medium risk investment opportunities.</p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Real Estate -->
          <div class="group p-8 rounded-[40px] bg-[#fbfbfc] border border-gray-100 transition-all hover:bg-white hover:shadow-2xl hover:-translate-y-2">
            <div class="w-full h-48 rounded-[30px] overflow-hidden mb-8">
              <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800" alt="Real Estate" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
            </div>
            <div class="flex items-center justify-between mb-4">
               <span class="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider">Real Estate</span>
               <span class="text-green-600 font-bold">Open</span>
            </div>
            <h3 class="text-2xl font-black text-[#0d1b2a] mb-2">Modern Apartments</h3>
            <p class="text-sm font-bold text-purple-600 mb-6 uppercase tracking-widest">22.5% Returns • 12 Months</p>
            <p class="text-gray-500 font-medium mb-8">Invest in high-yield residential properties across major cities with proven maintenance tracks.</p>
            <button class="w-full py-4 px-6 bg-[#0d1b2a] text-white rounded-2xl font-bold hover:bg-gray-800 transition-all">Invest Now</button>
          </div>

          <!-- Agriculture -->
          <div class="group p-8 rounded-[40px] bg-[#fbfbfc] border border-gray-100 transition-all hover:bg-white hover:shadow-2xl hover:-translate-y-2">
            <div class="w-full h-48 rounded-[30px] overflow-hidden mb-8">
              <img src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=800" alt="Agric" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
            </div>
            <div class="flex items-center justify-between mb-4">
               <span class="px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-xs font-bold uppercase tracking-wider">Agriculture</span>
               <span class="text-red-500 font-bold">Sold Out</span>
            </div>
            <h3 class="text-2xl font-black text-[#0d1b2a] mb-2">Sustainable Poultry</h3>
            <p class="text-sm font-bold text-purple-600 mb-6 uppercase tracking-widest">18.5% Returns • 9 Months</p>
            <p class="text-gray-500 font-medium mb-8">Support local farmers while earning competitive returns through our smart poultry farming scheme.</p>
            <button class="w-full py-4 px-6 bg-gray-100 text-gray-400 rounded-2xl font-bold cursor-not-allowed">Waitlist Only</button>
          </div>

          <!-- Transportation -->
          <div class="group p-8 rounded-[40px] bg-[#fbfbfc] border border-gray-100 transition-all hover:bg-white hover:shadow-2xl hover:-translate-y-2">
            <div class="w-full h-48 rounded-[30px] overflow-hidden mb-8">
              <img src="https://images.unsplash.com/photo-1519003722822-6d51ce33b3c3?auto=format&fit=crop&q=80&w=800" alt="Transport" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
            </div>
            <div class="flex items-center justify-between mb-4">
               <span class="px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-xs font-bold uppercase tracking-wider">Transportation</span>
               <span class="text-green-600 font-bold">Open</span>
            </div>
            <h3 class="text-2xl font-black text-[#0d1b2a] mb-2">Logistics Fleet</h3>
            <p class="text-sm font-bold text-purple-600 mb-6 uppercase tracking-widest">25% Returns • 12 Months</p>
            <p class="text-gray-500 font-medium mb-8">Fuel the backbone of commerce by investing in our expanding interstate logistics and delivery network.</p>
            <button class="w-full py-4 px-6 bg-[#0d1b2a] text-white rounded-2xl font-bold hover:bg-gray-800 transition-all">Invest Now</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Invest Section -->
    <section class="py-24 bg-[#051121] text-white overflow-hidden relative">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[150px]"></div>
      </div>
      
      <div class="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div class="flex flex-col lg:flex-row items-center gap-20">
          <div class="lg:w-1/2">
             <h2 class="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tighter">Why invest with <span class="text-purple-500">DogoFinance</span>?</h2>
             <div class="space-y-8">
                <div class="flex items-start space-x-6">
                  <div class="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                    <i class="ri-shield-user-fill text-2xl text-purple-400"></i>
                  </div>
                  <div>
                    <h4 class="text-xl font-bold mb-2">Vetted Opportunities</h4>
                    <p class="text-gray-400 font-medium">Every investment listed on DogoFinance goes through a rigorous internal and external due diligence process.</p>
                  </div>
                </div>
                <div class="flex items-start space-x-6">
                  <div class="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                    <i class="ri-funds-box-fill text-2xl text-purple-400"></i>
                  </div>
                  <div>
                    <h4 class="text-xl font-bold mb-2">Low Entry Barrier</h4>
                    <p class="text-gray-400 font-medium">You don't need millions to start building wealth. Invest in premium assets with as little as ₦5,000.</p>
                  </div>
                </div>
                <div class="flex items-start space-x-6">
                  <div class="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                    <i class="ri-eye-fill text-2xl text-purple-400"></i>
                  </div>
                  <div>
                    <h4 class="text-xl font-bold mb-2">Full Transparency</h4>
                    <p class="text-gray-400 font-medium">Monitor your investments in real-time. No hidden charges, no surprises. Just clear growth.</p>
                  </div>
                </div>
             </div>
          </div>
          <div class="lg:w-1/2">
            <div class="p-10 bg-white/5 backdrop-blur-3xl rounded-[50px] border border-white/10">
               <i class="ri-double-quotes-l text-6xl text-purple-600 mb-8 block"></i>
               <p class="text-2xl font-medium text-purple-100 italic mb-10 leading-relaxed font-serif">"Investify has completely changed how I think about my future. I start small, but the returns are making a huge difference in my long-term plans."</p>
               <div class="flex items-center space-x-4">
                 <div class="w-16 h-16 bg-gray-500 rounded-full overflow-hidden border-2 border-purple-600">
                    <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150" alt="Investor">
                 </div>
                 <div>
                   <p class="font-black text-xl">Sandra Nwosu</p>
                   <p class="text-purple-400 font-bold uppercase tracking-widest text-xs">Platinum Investor</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- How it Works (Process Steps) -->
    <section class="py-24 bg-[#fbfbfc]">
       <div class="max-w-7xl mx-auto px-6 md:px-12 text-center">
         <h2 class="text-4xl md:text-5xl font-black text-[#0d1b2a] mb-20 tracking-tight">How to start investing</h2>
         <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
           <div class="flex flex-col items-center">
             <div class="w-12 h-12 bg-[#0d1b2a] text-white rounded-full flex items-center justify-center font-black text-xl mb-6">1</div>
             <p class="font-black text-xl mb-3 text-[#0d1b2a]">Create an Account</p>
             <p class="text-gray-500 font-medium">Sign up for a free account via our website or mobile app.</p>
           </div>
           <div class="flex flex-col items-center">
             <div class="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-black text-xl mb-6">2</div>
             <p class="font-black text-xl mb-3 text-[#0d1b2a]">Browse Opportunities</p>
             <p class="text-gray-500 font-medium">Go to 'Invest' to explore diverse, vetted opportunities.</p>
           </div>
           <div class="flex flex-col items-center">
             <div class="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-black text-xl mb-6">3</div>
             <p class="font-black text-xl mb-3 text-[#0d1b2a]">Select & Invest</p>
             <p class="text-gray-500 font-medium">Choose a sector, input your units and confirm your investment.</p>
           </div>
           <div class="flex flex-col items-center">
             <div class="w-12 h-12 bg-[#0d1b2a] text-white rounded-full flex items-center justify-center font-black text-xl mb-6">4</div>
             <p class="font-black text-xl mb-3 text-[#0d1b2a]">Watch it Grow</p>
             <p class="text-gray-500 font-medium">Sit back and monitor your earnings from your dashboard.</p>
           </div>
         </div>
       </div>
    </section>

    <!-- Final CTA -->
    <section class="py-24 bg-white relative">
      <div class="max-w-4xl mx-auto px-6 md:px-12 text-center">
         <div class="p-16 rounded-[60px] bg-gradient-to-br from-[#0d1b2a] to-purple-900 text-white shadow-3xl overflow-hidden relative">
           <!-- Decorative shapes -->
            <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full"></div>
            <div class="absolute -bottom-10 -left-10 w-64 h-64 bg-white/5 rounded-full"></div>
            
            <h2 class="text-4xl md:text-5xl font-black mb-8 leading-tight">Secure your future <br> with Investify.</h2>
            <p class="text-xl text-purple-200 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">Join over 1 million Nigerians who are building their wealth with DogoFinance Investify.</p>
            <button class="bg-white text-[#0d1b2a] px-12 py-5 rounded-2xl font-black text-lg hover:bg-gray-100 transition-all shadow-xl hover:-translate-y-2">
              Start Your Journey
            </button>
         </div>
      </div>
    </section>
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
export class InvestmentComponent {}
