import { Component, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

interface SavingsPlan {
  name: string;
  headline: string;
  subheadline: string;
  interestRate: string;
  themeColor: string;
  accentColor: string;
  visualUrl: string;
  features: { title: string; desc: string; icon: string }[];
  howItWorks: string[];
  ctaText: string;
}

const SAVINGS_PLANS_DATA: Record<string, SavingsPlan> = {
  'piggybank': {
    name: 'Piggybank',
    headline: "Automated savings. <br><span class='text-[#0d60d8]'>Digital at its best.</span>",
    subheadline: 'Strictly for savings. Automatically take money from your bank account to DogoFinance daily, weekly, or monthly.',
    interestRate: '10% p.a',
    themeColor: '#0d60d8',
    accentColor: '#e1f0ff',
    visualUrl: '/images/piggybank-hero.png',
    features: [
      { title: 'Automated Savings', desc: 'Set it and forget it. Daily, weekly or monthly.', icon: 'ri-timer-flash-line' },
      { title: 'Quick Save', desc: 'Add extra funds anytime you want with a single click.', icon: 'ri-flashlight-line' },
      { title: 'Safe & Secure', desc: 'Bank-grade security keeping your funds protected.', icon: 'ri-shield-check-line' }
    ],
    howItWorks: [
      'Create a free DogoFinance account.',
      'Select the Piggybank plan on your dashboard.',
      'Decide how much and how often you want to save.',
      'Relax and watch your wealth grow seamlessly.'
    ],
    ctaText: 'Start Saving Now'
  },
  'safelock': {
    name: 'SafeLock',
    headline: "Fixed savings. <br><span class='text-[#fabc2c]'>Paid upfront.</span>",
    subheadline: 'Lock funds for a specific period of time and earn higher interest. Interest is paid directly into your account immediately.',
    interestRate: '15.5% p.a',
    themeColor: '#fabc2c',
    accentColor: '#fff9e6',
    visualUrl: '/images/safelock-hero.png',
    features: [
      { title: 'Fixed Tenure', desc: 'Set a target date for your savings and lock it in.', icon: 'ri-lock-star-line' },
      { title: 'Immediate Interest', desc: 'Get your full interest upfront into your main wallet.', icon: 'ri-coins-line' },
      { title: 'No Withdrawals', desc: 'Strict discipline by preventing early access to funds.', icon: 'ri-safe-2-line' }
    ],
    howItWorks: [
      'Navigate to the SafeLock section.',
      'Input the amount you want to lock away.',
      'Choose a maturity date (30 to 1000 days).',
      'Receive your interest instantly.'
    ],
    ctaText: 'Create a SafeLock'
  },
  'targets': {
    name: 'Target Savings',
    headline: "Save for goals. <br><span class='text-green-600'>Reach them faster.</span>",
    subheadline: 'Saving for a car, house, wedding or even flight tickets? Group savings or solo, we help you reach your goals.',
    interestRate: '11% p.a',
    themeColor: '#27ae60',
    accentColor: '#e8f6ed',
    visualUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=800',
    features: [
      { title: 'Custom Goals', desc: 'Create unique targets for everything you care about.', icon: 'ri-focus-3-line' },
      { title: 'Group Challenges', desc: 'Join groups of people saving for similar goals.', icon: 'ri-group-fill' },
      { title: 'Auto-Top-up', desc: 'Automatically add funds to your targets every day.', icon: 'ri-magic-line' }
    ],
    howItWorks: [
      'Pick a goal or create your own custom target.',
      'Set an amount and a target date.',
      'Optionally invite friends to a group challenge.',
      'Automate your savings to hit the goal.'
    ],
    ctaText: 'Find a Target'
  },
  'flex-naira': {
    name: 'Flex Naira',
    headline: "Flexible savings. <br><span class='text-pink-600'>Cash any time.</span>",
    subheadline: 'Keep your small-small money for everyday needs while still earning interest. Unlimited withdrawals, no penalties.',
    interestRate: '8.5% p.a',
    themeColor: '#d62246',
    accentColor: '#ffeef1',
    visualUrl: 'https://images.unsplash.com/photo-1593672715438-d88a75639f5e?auto=format&fit=crop&q=80&w=800',
    features: [
      { title: 'Free Withdrawals', desc: 'Access your money whenever you need it for free.', icon: 'ri-refund-2-line' },
      { title: 'Earn Interest', desc: 'Your emergency funds don\'t have to be idle.', icon: 'ri-percent-line' },
      { title: 'Direct Transfers', desc: 'Send money to any bank account instantly.', icon: 'ri-send-plane-fill' }
    ],
    howItWorks: [
      'Activate your Flex Naira account.',
      'Transfer funds into your unique Flex account number.',
      'Withdraw or transfer to friends whenever you want.',
      'Earn interest paid out at the end of each month.'
    ],
    ctaText: 'Enable Flex'
  },
  'flex-dollar': {
    name: 'Flex Dollar',
    headline: "Save in Dollars. <br><span class='text-blue-500'>Protect your wealth.</span>",
    subheadline: 'Save, invest and transfer in USD. Hedge against inflation and devaluation by keeping your money in dollars.',
    interestRate: '7% p.a',
    themeColor: '#0070ba',
    accentColor: '#eef6fc',
    visualUrl: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&q=80&w=800',
    features: [
      { title: 'Hedge Inflation', desc: 'Keep your money stable against local currency shifts.', icon: 'ri-global-line' },
      { title: 'Convert Instantly', desc: 'Switch between Naira and Dollar at competitive rates.', icon: 'ri-exchange-dollar-line' },
      { title: 'Dollar Payouts', desc: 'Withdraw in USD directly to your domiciliary account.', icon: 'ri-bank-card-fill' }
    ],
    howItWorks: [
      'Enable your Flex Dollar wallet on your dashboard.',
      'Buy USD using your Naira balance or bank card.',
      'Start earning returns in hard currency.',
      'Withdraw in USD or Naira anytime.'
    ],
    ctaText: 'Safe in Dollars'
  },
  'house-money': {
    name: 'House Money',
    headline: "House owner. <br><span class='text-orange-600'>Brick by brick.</span>",
    subheadline: 'The easiest way to save for rent or buy your dream home. Set aside funds specifically for your living space.',
    interestRate: '12% p.a',
    themeColor: '#e67e22',
    accentColor: '#fff3e8',
    visualUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800',
    features: [
      { title: 'Rent Sorter', desc: 'Manage your monthly rent savings in a separate bucket.', icon: 'ri-home-4-line' },
      { title: 'Long-term Growth', desc: 'Accumulate capital for land or construction projects.', icon: 'ri-building-2-line' },
      { title: 'Zero Fees', desc: 'No maintenance charges on your housing wallet.', icon: 'ri-creative-commons-zero-line' }
    ],
    howItWorks: [
      'Set your housing goal (Total amount needed).',
      'Create a dedicated wallet for House Money.',
      'Automate your contributions monthly.',
      'Cash out when it’s time to move in.'
    ],
    ctaText: 'Secure My Home'
  }
};

@Component({
  selector: 'app-savings-plan',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './savings-plan.component.html',
  styleUrl: './savings-plan.component.css'
})
export class SavingsPlanComponent {
  private route = inject(ActivatedRoute);
  
  // State Signals
  currentPlanKey = signal<string>('');
  
  // Computed Plan Data
  plan = computed(() => {
    const key = this.currentPlanKey();
    return SAVINGS_PLANS_DATA[key] || SAVINGS_PLANS_DATA['piggybank'];
  });

  constructor() {
    // React to route parameter changes
    effect(() => {
      this.route.params.subscribe(params => {
        this.currentPlanKey.set(params['plan'] || 'piggybank');
        window.scrollTo(0, 0); // Reset scroll on navigation
      });
    });
  }
}
