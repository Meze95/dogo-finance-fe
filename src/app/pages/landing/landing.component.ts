import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Hero Section -->
    <section class="max-w-7xl mx-auto px-6 md:px-12 pt-20 pb-16">
      <div class="grid lg:grid-cols-2 gap-16 items-center">
        <!-- Text Content -->
        <div class="relative z-10">
          <div class="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-bold mb-8 animate-fade-in">
            <i class="ri-heart-3-fill"></i>
            <span>Over 6 Million Savers rely on us</span>
          </div>
          <h1 class="text-6xl md:text-[90px] font-[900] text-[#0d1b2a] leading-[0.95] mb-8 tracking-tighter">
            The <span class="text-blue-600">smarter</span> <br>
            way to save <br>
            & invest.
          </h1>
          <p class="text-xl text-gray-500 mb-12 max-w-lg leading-relaxed font-medium">
            Join millions of people who are securing their financial future with DogoFinance. Build wealth with ease and total transparency.
          </p>
          
          <div class="flex flex-wrap gap-4">
            <button class="flex items-center space-x-3 bg-blue-600 text-white px-10 py-5 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/30 hover:-translate-y-1">
              <i class="ri-flashlight-fill text-xl"></i>
              <span>Get Started Now</span>
            </button>
            <div class="flex items-center space-x-4">
              <button class="w-14 h-14 flex items-center justify-center bg-white border-2 border-gray-100 text-[#0d1b2a] rounded-2xl hover:bg-gray-50 transition-all shadow-sm">
                <i class="ri-apple-fill text-2xl"></i>
              </button>
              <button class="w-14 h-14 flex items-center justify-center bg-white border-2 border-gray-100 text-[#0d1b2a] rounded-2xl hover:bg-gray-50 transition-all shadow-sm">
                <i class="ri-google-play-fill text-2xl"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Hero Visual (Modern Stacked Layout) -->
        <div class="relative flex justify-center lg:justify-end">
          <!-- Abstract Background Shape -->
          <div class="absolute -right-20 -top-20 w-[600px] h-[600px] bg-blue-50 rounded-full blur-[100px] opacity-60"></div>
          
          <div class="relative z-10 w-full max-w-lg">
            <!-- Main visual (Phone/Dashboard overlap) -->
            <div class="bg-white/40 backdrop-blur-2xl rounded-[40px] p-4 shadow-[0_50px_100px_rgba(0,0,0,0.1)] border border-white/50">
              <div class="rounded-[32px] overflow-hidden relative aspect-[4/5] bg-blue-600">
                <img src="/images/hero-visual.png" alt="DogoFinance Hero" class="w-full h-full object-cover">
                <!-- Subtle Gradient Overlay -->
                <div class="absolute inset-0 bg-gradient-to-t from-blue-900/30 to-transparent pointer-events-none"></div>
              </div>
            </div>

            <!-- Floating Micro-UI Cards -->
            <div class="absolute -left-12 top-1/4 animate-float">
              <div class="bg-white/90 backdrop-blur-xl p-5 rounded-3xl shadow-2xl border border-white/50 flex items-center space-x-4">
                 <div class="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                    <i class="ri-line-chart-line text-green-600 text-xl font-bold"></i>
                 </div>
                 <div>
                    <p class="text-xs text-gray-500 font-bold uppercase tracking-widest">Returns</p>
                    <p class="text-lg font-black text-[#0d1b2a]">+ ₦145,000</p>
                 </div>
              </div>
            </div>

            <div class="absolute -right-8 bottom-1/4 animate-float-delayed">
              <div class="bg-white/90 backdrop-blur-xl p-5 rounded-3xl shadow-2xl border border-white/50 flex items-center space-x-4">
                 <div class="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center">
                    <i class="ri-heart-2-fill text-pink-600 text-xl"></i>
                 </div>
                 <div>
                    <p class="text-xs text-gray-500 font-bold uppercase tracking-widest">Savings Goal</p>
                    <p class="text-lg font-black text-[#0d1b2a]">82% Achieved</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- As Featured In Bar -->
    <div class="relative z-20 flex justify-center -mt-8 mb-16 px-6">
      <div class="bg-white/80 backdrop-blur-md rounded-full shadow-[0_10px_50px_rgba(0,0,0,0.05)] py-5 px-12 border border-white/50 flex items-center space-x-12 max-w-5xl overflow-x-auto no-scrollbar">
        <span class="text-[10px] uppercase font-black text-gray-400 whitespace-nowrap tracking-widest">As featured in</span>
        <div class="flex items-center space-x-12">
          <span class="text-lg font-black text-gray-300 hover:text-gray-900 transition-colors cursor-default tracking-tighter">techcabal</span>
          <span class="text-lg font-black text-gray-300 hover:text-gray-900 transition-colors cursor-default tracking-tighter">CNBC</span>
          <span class="text-lg font-black text-gray-300 hover:text-gray-900 transition-colors cursor-default tracking-tighter">TechCrunch</span>
          <span class="text-lg font-black text-gray-300 hover:text-gray-900 transition-colors cursor-default tracking-tighter">PYMNTS</span>
          <span class="text-lg font-black text-gray-300 hover:text-gray-900 transition-colors cursor-default tracking-tighter">Fast Company</span>
          <span class="text-lg font-black text-gray-300 hover:text-gray-900 transition-colors cursor-default tracking-tighter">CIO</span>
        </div>
      </div>
    </div>

    <!-- Products Section -->
    <section class="py-24 bg-white relative overflow-hidden">
      <!-- Background Accents -->
      <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      
      <div class="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div class="text-center max-w-3xl mx-auto mb-20">
          <h2 class="text-4xl md:text-5xl font-black text-[#0d1b2a] mb-6 leading-tight tracking-tight">The better way to manage your money.</h2>
          <p class="text-xl text-gray-500 font-medium">DogoFinance offers a suite of products designed to help you save more, invest smarter, and grow your wealth automatically.</p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Piggybank -->
          <div class="group p-10 rounded-[40px] bg-[#f2f7ff] border border-blue-50 transition-all hover:bg-white hover:shadow-2xl hover:shadow-blue-200/50 hover:-translate-y-2">
            <div class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-200">
              <i class="ri-shield-fill text-white text-3xl"></i>
            </div>
            <h3 class="text-2xl font-black text-[#0d1b2a] mb-4">Automated Savings</h3>
            <p class="text-gray-500 font-medium leading-relaxed mb-8">Build a dedicated savings habit. Save automatically on a daily, weekly or monthly basis.</p>
            <div class="flex items-center text-blue-600 font-black group-hover:translate-x-2 transition-transform cursor-pointer">
              <span>Try Piggybank</span>
              <i class="ri-arrow-right-line ml-2"></i>
            </div>
          </div>

          <!-- Safelock -->
          <div class="group p-10 rounded-[40px] bg-[#f0fdfa] border border-teal-50 transition-all hover:bg-white hover:shadow-2xl hover:shadow-teal-200/50 hover:-translate-y-2">
            <div class="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-teal-200">
              <i class="ri-lock-2-fill text-white text-3xl"></i>
            </div>
            <h3 class="text-2xl font-black text-[#0d1b2a] mb-4">Fixed Savings</h3>
            <p class="text-gray-500 font-medium leading-relaxed mb-8">Lock funds away for a fixed period and earn up to 15.5% p.a. interest upfront.</p>
            <div class="flex items-center text-teal-600 font-black group-hover:translate-x-2 transition-transform cursor-pointer">
              <span>Try Safelock</span>
              <i class="ri-arrow-right-line ml-2"></i>
            </div>
          </div>

          <!-- Target Savings -->
          <div class="group p-10 rounded-[40px] bg-[#faf5ff] border border-purple-50 transition-all hover:bg-white hover:shadow-2xl hover:shadow-purple-200/50 hover:-translate-y-2">
            <div class="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-purple-200">
              <i class="ri-target-fill text-white text-3xl"></i>
            </div>
            <h3 class="text-2xl font-black text-[#0d1b2a] mb-4">Goal-oriented Savings</h3>
            <p class="text-gray-500 font-medium leading-relaxed mb-8">Reach your targets faster by saving towards a specific goal like a new car, wedding, or rent.</p>
            <div class="flex items-center text-purple-600 font-black group-hover:translate-x-2 transition-transform cursor-pointer">
              <span>Try Targets</span>
              <i class="ri-arrow-right-line ml-2"></i>
            </div>
          </div>

          <!-- Investify -->
          <div class="lg:col-span-3 p-12 rounded-[50px] bg-[#0d1b2a] text-white flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden relative">
            <!-- Decorative circle -->
            <div class="absolute right-0 bottom-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
            
            <div class="max-w-2xl text-center lg:text-left">
              <span class="inline-block bg-white/10 text-white px-4 py-1.5 rounded-full text-sm font-bold mb-6">High Returns</span>
              <h3 class="text-4xl md:text-5xl font-black mb-6">Diverse Investment Opportunities</h3>
              <p class="text-xl text-gray-300 font-medium mb-10 leading-relaxed">
                Invest small amounts in verified, low-to-medium risk investment opportunities. Start your journey with as little as ₦5,000.
              </p>
              <button class="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black hover:bg-blue-700 transition-all hover:scale-105">
                Explore Investify
              </button>
            </div>
            <div class="w-full lg:w-1/3 flex justify-center">
              <div class="w-64 h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-[60px] flex items-center justify-center p-8 group-hover:rotate-6 transition-transform">
                <i class="ri-line-chart-fill text-[120px] text-white/20 absolute"></i>
                <div class="relative z-10 text-center">
                  <p class="text-4xl font-black mb-1">Up to 25%</p>
                  <p class="text-white/80 font-bold uppercase tracking-widest text-sm">Returns per annum</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Security Section -->
    <section class="py-24 bg-[#fbfbfc]">
      <div class="max-w-7xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center gap-20">
        <div class="lg:w-1/2 text-center lg:text-left">
          <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-8 mx-auto lg:mx-0 shadow-xl shadow-blue-200">
            <i class="ri-shield-check-fill text-white text-3xl"></i>
          </div>
          <h2 class="text-4xl md:text-6xl font-[900] text-[#0d1b2a] mb-8 leading-tight tracking-tighter">Your security is <br> our priority.</h2>
          <p class="text-xl text-gray-500 font-medium leading-relaxed mb-10">
            DogoFinance uses the highest level of Internet Security, and it is secured by 256 bits SSL security encryption to ensure that your information is completely protected.
          </p>
          <div class="flex items-center justify-center lg:justify-start space-x-4">
             <span class="px-6 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm font-bold text-gray-600 flex items-center">
               <i class="ri-lock-fill mr-2 text-blue-600"></i>
               Bank Grade Security
             </span>
             <span class="px-6 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm font-bold text-gray-600 flex items-center">
               <i class="ri-file-shield-2-fill mr-2 text-blue-600"></i>
               NDPR Compliant
             </span>
          </div>
        </div>
        <div class="lg:w-1/2 relative">
          <div class="relative z-10 grid grid-cols-2 gap-6">
            <div class="bg-white p-8 rounded-[40px] shadow-xl border border-gray-50 mt-12">
               <i class="ri-fingerprint-fill text-4xl text-blue-600 mb-4 block"></i>
               <h4 class="font-black text-xl mb-2 text-[#0d1b2a]">Two-Factor</h4>
               <p class="text-sm font-medium text-gray-400">Extra layer for every login</p>
            </div>
            <div class="bg-white p-8 rounded-[40px] shadow-xl border border-gray-50">
               <i class="ri-notification-badge-fill text-4xl text-pink-600 mb-4 block"></i>
               <h4 class="font-black text-xl mb-2 text-[#0d1b2a]">Alerts</h4>
               <p class="text-sm font-medium text-gray-400">Realtime fraud detection</p>
            </div>
            <div class="bg-white p-8 rounded-[40px] shadow-xl border border-gray-50 -mt-6">
               <i class="ri-history-line text-4xl text-teal-600 mb-4 block"></i>
               <h4 class="font-black text-xl mb-2 text-[#0d1b2a]">Activity</h4>
               <p class="text-sm font-medium text-gray-400">Full audit of all actions</p>
            </div>
            <div class="bg-white p-8 rounded-[40px] shadow-xl border border-gray-50 mt-6">
               <i class="ri-copper-diamond-fill text-4xl text-orange-600 mb-4 block"></i>
               <h4 class="font-black text-xl mb-2 text-[#0d1b2a]">Encrypted</h4>
               <p class="text-sm font-medium text-gray-400">256-bit bank encryption</p>
            </div>
          </div>
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-100/50 rounded-full blur-3xl -z-10"></div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="py-24 bg-white relative">
      <div class="max-w-7xl mx-auto px-6 md:px-12">
        <div class="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
          <div class="max-w-2xl">
            <h2 class="text-4xl md:text-5xl font-[900] text-[#0d1b2a] mb-6 tracking-tight">Meet our amazing savers.</h2>
            <p class="text-xl text-gray-500 font-medium">Over 6 million people are already building their wealth with DogoFinance. Here's what some of them have to say.</p>
          </div>
          <button class="bg-[#0d1b2a] text-white px-8 py-4 rounded-xl font-bold flex items-center group">
            <span>See more stories</span>
            <i class="ri-arrow-right-line ml-2 group-hover:translate-x-1 transition-transform"></i>
          </button>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Testimonial 1 -->
          <div class="p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all">
            <div class="flex items-center space-x-1 text-orange-400 mb-6">
              <i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i>
            </div>
            <p class="text-lg font-medium text-gray-600 italic mb-8">"DogoFinance helped me save for my master's degree without even feeling the pinch. The automated savings is a game changer!"</p>
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150" alt="User">
              </div>
              <div>
                <p class="font-black text-[#0d1b2a]">Chioma Adebayo</p>
                <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">Master's Student</p>
              </div>
            </div>
          </div>
          
          <!-- Testimonial 2 -->
          <div class="p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all">
            <div class="flex items-center space-x-1 text-orange-400 mb-6">
              <i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i>
            </div>
            <p class="text-lg font-medium text-gray-600 italic mb-8">"I've tried many platforms, but the returns on SafeLock are unmatched. My money is finally working as hard as I do."</p>
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150" alt="User">
              </div>
              <div>
                <p class="font-black text-[#0d1b2a]">Bolaji Jenkins</p>
                <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">Software Engineer</p>
              </div>
            </div>
          </div>

          <!-- Testimonial 3 -->
          <div class="p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all">
            <div class="flex items-center space-x-1 text-orange-400 mb-6">
              <i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i>
            </div>
            <p class="text-lg font-medium text-gray-600 italic mb-8">"Target savings helped our family save for our first home in just 2 years. The discipline it provides is incredible."</p>
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=150" alt="User">
              </div>
              <div>
                <p class="font-black text-[#0d1b2a]">Mrs. Funke Peters</p>
                <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">Business Owner</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
      background-color: #ffffff;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }

    @keyframes float-delayed {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(20px); }
    }

    @keyframes fade-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .animate-float {
      animation: float 5s ease-in-out infinite;
    }

    .animate-float-delayed {
      animation: float-delayed 6s ease-in-out infinite;
    }

    .animate-fade-in {
      animation: fade-in 1s ease-out forwards;
    }

    /* Hide scrollbar but keep functionality */
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `]
})
export class LandingComponent {}
