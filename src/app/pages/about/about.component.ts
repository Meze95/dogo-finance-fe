import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {

  heroValues = [
    { icon: 'ri-scales-3-fill', label: 'Shariah-First by Design', sub: 'Every product SSB-certified before release' },
    { icon: 'ri-hand-coin-fill', label: '0% Riba. Always.', sub: 'No interest in any layer of the platform' },
    { icon: 'ri-nigeria-fill', label: 'Nigeria-Native', sub: 'NGN-denominated, BVN + NIN KYC, NIBSS payments' },
    { icon: 'ri-global-fill', label: 'Africa\'s Future', sub: 'Building Islamic finance infrastructure for the continent' }
  ];

  heroStats = [
    { value: '100M+', label: 'Nigerian Muslims' },
    { value: '₦10B', label: 'Target AUM Y1' },
    { value: '0%', label: 'Riba. Ever.' }
  ];

  existPoints = [
    {
      label: 'Technology is ready',
      sub: 'Mobile-first Nigeria, 200M+ population, digital adoption accelerating'
    },
    {
      label: 'Regulation is evolving',
      // TODO: Uncomment when SEC & CBN licensing is complete
      // sub: 'CBN & SEC frameworks for Islamic finance now established in Nigeria'
      sub: 'Regulatory frameworks for Islamic finance now being established in Nigeria'
    },
    {
      label: 'Demand for ethical finance is rising',
      sub: 'Sukuk issuances growing, Shariah awareness increasing nationally'
    }
  ];

  principles = [
    {
      icon: 'ri-scales-3-fill',
      title: 'Governance & Shariah Integrity',
      desc: 'We operate within regulatory frameworks and under independent Shariah oversight — every product certified before release.'
    },
    {
      icon: 'ri-lightbulb-flash-fill',
      title: 'Purpose-Driven Design',
      desc: 'We simplify halal finance through clear, intuitive products that put the user first without compromising on principles.'
    },
    {
      icon: 'ri-lock-password-fill',
      title: 'Security & Trust',
      desc: 'Client assets and data are protected through strong security standards, cybersecurity controls, and AML compliance.'
    },
    {
      icon: 'ri-heart-3-fill',
      title: 'Long-Term Partnership',
      desc: 'Our goal is to support clients through every stage of their financial journey — not just a single transaction.'
    }
  ];

  segments = [
    {
      icon: 'ri-user-3-fill',
      tag: 'Segment 01',
      title: 'Young Professionals & Salary Earners',
      desc: 'Individuals building financial foundations who want a simple Shariah-compliant way to save, earn halal returns, and manage money through one trusted platform.'
    },
    {
      icon: 'ri-home-heart-fill',
      tag: 'Segment 02',
      title: 'Families & Household Planners',
      desc: 'Parents and caregivers planning for education, housing, and long-term security, using transparent faith-aligned tools to grow wealth responsibly.'
    },
    {
      icon: 'ri-briefcase-fill',
      tag: 'Segment 03',
      title: 'Entrepreneurs & Business Owners',
      desc: 'Small and medium business owners managing cash flow, preserving capital, and accessing halal investment opportunities alongside everyday payments.'
    },
    {
      icon: 'ri-building-4-fill',
      tag: 'Segment 04',
      title: 'High Net Worth Individuals & Institutions',
      desc: 'Experienced investors and organisations seeking professional Shariah-compliant asset management, treasury solutions, and global halal investment access.'
    }
  ];

  governance = [
    // TODO: Uncomment when SEC & CBN licensing is complete
    // {
    //   icon: 'ri-government-fill',
    //   label: 'SEC & CBN Engagement',
    //   desc: 'Structured to meet Nigeria\'s regulatory requirements under the Securities and Exchange Commission and Central Bank of Nigeria.'
    // },
    {
      icon: 'ri-scales-3-fill',
      label: 'Independent Shariah Advisory Board',
      desc: 'Reviews all products, monitors compliance, and conducts regular audits — no product goes live without board sign-off.'
    },
    {
      icon: 'ri-shield-check-fill',
      label: 'Enterprise Risk Management',
      desc: 'Comprehensive framework covering data protection compliance, cybersecurity standards, and anti-money laundering controls.'
    },
    {
      icon: 'ri-fingerprint-fill',
      label: 'BVN + NIN Identity Verification',
      desc: 'Nigerian KYC standards fully implemented — BVN via NIBSS and NIN via NIMC, with liveness checks and NDPR compliance.'
    }
  ];
}
