import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';

// =============================================
// CMS-DRIVEN PRODUCT DATA
// Replace with API call: GET /api/products/:plan
// =============================================
export interface ProductData {
  id: string;
  name: string;
  tagline: string;
  headline: string;
  subheadline: string;
  returnRate: string;
  minInvestment: string;
  tenor: string;
  icon: string;
  accentColor: string;
  accentLight: string;
  features: { icon: string; title: string; desc: string }[];
  howItWorks: { step: string; title: string; desc: string }[];
  faqs: { q: string; a: string }[];
}

export const PRODUCTS_DATA: Record<string, ProductData> = {
  'mudarabah': {
    id: 'mudarabah',
    name: 'Mudarabah',
    tagline: 'Profit-Sharing Investment Account',
    headline: 'Your Capital. Our Expertise. Shared Profits.',
    subheadline: 'The classic Islamic investment contract — you provide the capital, DOGO Finance manages it with full Shariah compliance. Profits are shared at an agreed ratio. No Riba, ever.',
    returnRate: 'Up to 18% p.a.',
    minInvestment: '₦10,000',
    tenor: '3, 6, or 12 months',
    icon: 'ri-seedling-fill',
    accentColor: '#1B4332',
    accentLight: '#e8f5ee',
    features: [
      { icon: 'ri-percent-line', title: '70/30 Profit Split', desc: '70% of profits go to you (Rabb-ul-Mal). 30% goes to DOGO Finance (Mudarib) for management. No interest, no fees.' },
      { icon: 'ri-shield-check-line', title: 'SSB Certified Contract', desc: 'Every Mudarabah contract is reviewed by our Shariah Supervisory Board before activation. Full AAOIFI compliance.' },
      { icon: 'ri-calendar-check-line', title: 'Flexible Tenors', desc: 'Choose 3, 6, or 12-month investment periods. Renew automatically or withdraw at maturity.' },
      { icon: 'ri-bar-chart-2-line', title: 'Quarterly Profit Declaration', desc: 'Returns are declared quarterly and credited directly to your Dogo Finance wallet in Naira.' }
    ],
    howItWorks: [
      { step: '01', title: 'Open Account & Verify KYC', desc: 'Create your Dogo Finance account. Verify your BVN and NIN. Takes under 5 minutes.' },
      { step: '02', title: 'Fund Your Wallet', desc: 'Top up via Paystack, bank transfer, or NIBSS NIP instant transfer. Minimum ₦10,000.' },
      { step: '03', title: 'Open Mudarabah Position', desc: 'Navigate to Invest → Mudarabah. Select your tenor and confirm your SSB-approved contract.' },
      { step: '04', title: 'Earn Profit Share', desc: 'DOGO Finance invests your capital in vetted Halal opportunities. Profit is declared quarterly and credited to your wallet.' }
    ],
    faqs: [
      { q: 'Is my capital guaranteed?', a: 'In Mudarabah, capital risk lies with the investor (Rabb-ul-Mal). DOGO Finance absorbs managerial loss. However, we invest only in vetted, low-risk Halal assets to protect your capital.' },
      { q: 'How is profit calculated?', a: 'Profit is calculated on a 70/30 split of the actual investment returns. This is declared quarterly based on the performance of our Halal investment pool.' },
      { q: 'Can I withdraw early?', a: 'Early withdrawal may affect your profit entitlement depending on the tenor. Please review the Mudarabah contract terms before investing.' }
    ]
  },
  'sukuk': {
    id: 'sukuk',
    name: 'Sukuk',
    tagline: 'Islamic Bond Marketplace',
    headline: 'Nigeria\'s Sukuk Marketplace. For Everyone.',
    subheadline: 'Invest in asset-backed Islamic bonds and earn fixed, predictable, Shariah-certified returns in Naira. Sukuk are certificates of ownership in real assets — not debt instruments.',
    returnRate: 'From 12% p.a.',
    minInvestment: '₦50,000',
    tenor: '1 to 5 years',
    icon: 'ri-bank-fill',
    accentColor: '#C9A84C',
    accentLight: '#fffbeb',
    features: [
      { icon: 'ri-building-4-line', title: 'Asset-Backed', desc: 'Every Sukuk on our platform is backed by real, tangible assets — real estate, infrastructure, commodities. No speculative instruments.' },
      { icon: 'ri-exchange-line', title: 'Primary & Secondary Market', desc: 'Subscribe to newly issued Sukuk or trade existing certificates in our secondary marketplace.' },
      { icon: 'ri-verified-badge-line', title: 'SSB & SEC Approved', desc: 'Every Sukuk listed on Dogo Finance is pre-screened by our SSB and registered with SEC Nigeria.' },
      { icon: 'ri-money-naira-circle-line', title: 'Naira-Denominated', desc: 'All Sukuk are priced and returned in Nigerian Naira (₦). No FX risk.' }
    ],
    howItWorks: [
      { step: '01', title: 'Browse Available Sukuk', desc: 'Navigate to Invest → Sukuk. View all live Sukuk by type, tenor, and projected return.' },
      { step: '02', title: 'Review the Prospectus', desc: 'Each Sukuk has a full SSB-certified prospectus. Read the asset details and risk summary.' },
      { step: '03', title: 'Subscribe', desc: 'Enter your investment amount (minimum ₦50,000). Funds are deducted from your wallet.' },
      { step: '04', title: 'Receive Returns', desc: 'Returns are paid at the schedule defined in each Sukuk prospectus — monthly, quarterly, or at maturity.' }
    ],
    faqs: [
      { q: 'What is the difference between Sukuk and conventional bonds?', a: 'Conventional bonds pay interest (Riba), which is Haram. Sukuk represent ownership in real assets and pay returns from the profits of those assets — fully Shariah-compliant.' },
      { q: 'Can I sell my Sukuk before maturity?', a: 'Yes. Secondary market trading is available for eligible Sukuk, subject to market liquidity and Shariah approval.' }
    ]
  },
  'halal-equity': {
    id: 'halal-equity',
    name: 'Halal Equity',
    tagline: 'Shariah-Screened Stock Portfolios',
    headline: 'Invest in Stocks. Without Compromise.',
    subheadline: 'Our AI-powered Haram screening engine reviews every stock in real-time using MSCI Islamic Index data — so you only ever own Shariah-compliant equity. Automatic purification included.',
    returnRate: 'Market returns',
    minInvestment: '₦25,000',
    tenor: 'Open-ended',
    icon: 'ri-line-chart-fill',
    accentColor: '#2D6A4F',
    accentLight: '#d1fae5',
    features: [
      { icon: 'ri-robot-line', title: 'AI Haram Screening', desc: 'Real-time screening powered by MSCI Islamic Index data. 7 prohibited criteria checked against every stock automatically.' },
      { icon: 'ri-recycle-line', title: 'Automatic Purification', desc: 'If any stock earns marginal impure income, our engine calculates the exact fraction and routes it to charity on your behalf.' },
      { icon: 'ri-pie-chart-line', title: 'Portfolio Baskets', desc: 'Choose from pre-built baskets: Nigeria Blue Chip Halal, Pan-African Growth, or Global Halal Tech.' },
      { icon: 'ri-refresh-line', title: 'Quarterly SSB Review', desc: 'Our SSB reviews all screened stocks quarterly to ensure continued compliance. Non-compliant stocks are automatically replaced.' }
    ],
    howItWorks: [
      { step: '01', title: 'Choose Your Risk Level', desc: 'Complete your investor risk profile. Our robo-advisor recommends the right Halal equity portfolio.' },
      { step: '02', title: 'Select a Portfolio Basket', desc: 'Choose Nigeria Blue Chip, Pan-African, or Global. Or build a custom screened portfolio.' },
      { step: '03', title: 'Invest', desc: 'Minimum ₦25,000. Funds are deployed into your chosen Halal-screened equities.' },
      { step: '04', title: 'Monitor & Grow', desc: 'Track your Naira-denominated portfolio performance in real time from your dashboard.' }
    ],
    faqs: [
      { q: 'How do you screen stocks?', a: 'We use MSCI Islamic Index data combined with our proprietary C#-powered Haram screening engine that checks 7 criteria: sector compliance, revenue ratios (< 5% from Haram activities), debt ratios, and more.' },
      { q: 'What happens to impure income?', a: 'Any tiny fraction of revenue deemed impure is calculated by our purification module and automatically donated to CBN-approved Nigerian Islamic charities. You receive a purification certificate.' }
    ]
  },
  'wakala': {
    id: 'wakala',
    name: 'Wakala',
    tagline: 'Agency-Based Investment Deposit',
    headline: 'Appoint Us. We Invest For You.',
    subheadline: 'In Wakala, you appoint DOGO Finance as your authorised agent (Wakeel) to invest your funds on your behalf. A fixed management fee is paid — any profit above the target goes entirely to you.',
    returnRate: '13% p.a. target',
    minInvestment: '₦25,000',
    tenor: '6 or 12 months',
    icon: 'ri-shield-star-fill',
    accentColor: '#9a7a2b',
    accentLight: '#fef9ee',
    features: [
      { icon: 'ri-handshake-line', title: 'Fixed Agency Fee', desc: 'DOGO Finance earns a fixed Wakalah fee regardless of profit — aligning our interests with yours.' },
      { icon: 'ri-arrow-up-circle-line', title: 'Above-Target Profits', desc: 'Any returns above the agreed target profit rate are credited directly to you — not retained by DOGO Finance.' },
      { icon: 'ri-contract-line', title: 'Shariah-Approved Contract', desc: 'The Wakalah agreement is reviewed, approved, and monitored by our SSB quarterly.' },
      { icon: 'ri-lock-2-line', title: 'Capital Protection Cushion', desc: 'Dogo Finance maintains a profit equalisation reserve (PER) to smooth returns across periods.' }
    ],
    howItWorks: [
      { step: '01', title: 'Open Wakala Account', desc: 'Navigate to Invest → Wakala. Review and sign the digital Wakala agreement.' },
      { step: '02', title: 'Fund Your Position', desc: 'Minimum ₦25,000. Funds are received by DOGO Finance as Wakeel (agent).' },
      { step: '03', title: 'DOGO Invests On Your Behalf', desc: 'We invest in a diversified portfolio of Halal instruments within SSB-approved parameters.' },
      { step: '04', title: 'Receive Your Returns', desc: 'Returns are credited at 6 or 12-month maturity. Renew or withdraw to your wallet.' }
    ],
    faqs: [
      { q: 'How is Wakala different from Mudarabah?', a: 'In Mudarabah, DOGO Finance shares in the profits. In Wakala, DOGO Finance earns a fixed fee regardless of profit — making it more predictable for the investor.' }
    ]
  },
  'musharakah': {
    id: 'musharakah',
    name: 'Musharakah',
    tagline: 'Joint Venture Investment Fund',
    headline: 'Co-Invest. Co-Own. Share the Growth.',
    subheadline: 'Musharakah means partnership. You and DOGO Finance (and other investors) co-invest in a Halal business venture. Profits and losses are shared proportionately to capital contribution.',
    returnRate: '15–20% p.a.',
    minInvestment: '₦100,000',
    tenor: '12 to 36 months',
    icon: 'ri-team-fill',
    accentColor: '#374151',
    accentLight: '#f3f4f6',
    features: [
      { icon: 'ri-group-line', title: 'True Partnership Structure', desc: 'All partners share in both upside profits and downside losses proportionately — the most equitable Islamic finance contract.' },
      { icon: 'ri-business-line', title: 'Vetted Business Ventures', desc: 'Musharakah funds invest only in Nigerian SMEs and growth businesses that have passed our Shariah and credit screening.' },
      { icon: 'ri-scales-line', title: 'Proportionate Loss Sharing', desc: 'If the venture suffers a loss, it is shared proportionately among all partners. No liability beyond your capital contribution.' },
      { icon: 'ri-bar-chart-grouped-line', title: 'Diversified Pool', desc: 'Your investment is pooled with others, reducing single-business concentration risk while maintaining Shariah compliance.' }
    ],
    howItWorks: [
      { step: '01', title: 'Browse Musharakah Funds', desc: 'Review available joint venture funds with full business profiles, financials, and SSB sign-off.' },
      { step: '02', title: 'Subscribe to a Fund', desc: 'Minimum ₦100,000. Your contribution becomes an ownership interest in the fund.' },
      { step: '03', title: 'Monitor Progress', desc: 'Track the fund\'s business performance and quarterly earnings reports from your dashboard.' },
      { step: '04', title: 'Receive Profit Distribution', desc: 'Profits are distributed based on your ownership percentage at each reporting period.' }
    ],
    faqs: [
      { q: 'What if the business makes a loss?', a: 'In Musharakah, losses are shared proportionately to capital contribution. DOGO Finance only lists ventures with strong financial track records and Shariah compliance to minimise loss risk.' }
    ]
  },
  'ijarah': {
    id: 'ijarah',
    name: 'Ijarah',
    tagline: 'Asset-Leasing Investment Instrument',
    headline: 'Own the Asset. Earn the Lease.',
    subheadline: 'Ijarah is Islamic leasing. Invest in productive real assets — real estate, equipment, infrastructure — and earn stable lease income without any Riba element.',
    returnRate: '12–15% p.a.',
    minInvestment: '₦50,000',
    tenor: '12 to 60 months',
    icon: 'ri-building-2-fill',
    accentColor: '#7c3aed',
    accentLight: '#ede9fe',
    features: [
      { icon: 'ri-home-gear-line', title: 'Real Asset Backing', desc: 'Every Ijarah instrument is backed by a real, tangible, productive asset that generates lease income.' },
      { icon: 'ri-money-dollar-circle-line', title: 'Stable Lease Income', desc: 'Earn predictable monthly or quarterly lease payments — providing stability that equity cannot always offer.' },
      { icon: 'ri-building-3-line', title: 'Diverse Asset Classes', desc: 'Commercial real estate, manufacturing equipment, agricultural assets, and transport infrastructure.' },
      { icon: 'ri-shield-line', title: 'NDPR & CBN Compliant', desc: 'All Ijarah transactions comply with CBN Non-Interest Finance guidelines and are NDPR data-safe.' }
    ],
    howItWorks: [
      { step: '01', title: 'Browse Ijarah Listings', desc: 'View available leasing instruments with full asset descriptions, SSB certificate, and lease terms.' },
      { step: '02', title: 'Invest & Become Co-Owner', desc: 'Your investment gives you a proportionate ownership interest in the underlying asset.' },
      { step: '03', title: 'Tenant Pays Lease', desc: 'The lessee (tenant) pays lease rental to DOGO Finance, which is distributed to investors.' },
      { step: '04', title: 'Asset Sale at Maturity', desc: 'At lease end, the asset may be sold. Proceeds are distributed proportionately to investors.' }
    ],
    faqs: [
      { q: 'What happens if the asset is damaged?', a: 'As the lessor (owner), maintenance and insurance costs sit with the ownership pool. DOGO Finance manages this on behalf of all investors and ensures full asset insurance.' }
    ]
  }
};

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent {
  private route = inject(ActivatedRoute);
  
  planId = signal<string>('mudarabah');
  openFaq = signal<number | null>(null);

  product = computed(() => PRODUCTS_DATA[this.planId()] ?? PRODUCTS_DATA['mudarabah']);

  otherProducts = computed(() =>
    Object.values(PRODUCTS_DATA).filter(p => p.id !== this.planId())
  );

  constructor() {
    this.route.params.subscribe(params => {
      const plan = params['plan'] || 'mudarabah';
      this.planId.set(plan);
      this.openFaq.set(null);
      window.scrollTo(0, 0);
    });
  }

  toggleFaq(i: number) {
    this.openFaq.set(this.openFaq() === i ? null : i);
  }
}
