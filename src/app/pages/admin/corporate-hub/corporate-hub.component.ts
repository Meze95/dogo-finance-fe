import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/ui/button.component';
import { BadgeComponent } from '../../../shared/components/ui/badge.component';

declare var Swal: any;

export interface SettlementNairaAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
  bankBranch: string;
  isDefault: boolean;
}

export interface SettlementDomiciliaryAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
  correspondentBank: string;
  sortCode: string;
  swiftCode: string;
  beneficiaryAccountName: string;
  beneficiaryAccountNo: string;
  isDefault: boolean;
}

export interface CorporateDocument {
  name: string;
  type: string;
  status: 'verified' | 'pending' | 'unverified';
  fileName: string;
  fileSize: string;
  dateUploaded: string;
  notes?: string;
}

export interface CorporateDirector {
  name: string;
  role: string;
  shareholding: number;
  idType: string;
  idNumber: string;
  status: 'Verified' | 'Pending' | 'Unverified';
  
  title?: string;
  surname?: string;
  firstName?: string;
  otherNames?: string;
  dob?: string;
  email?: string;
  phone?: string;
  bvn?: string;
  residentialAddress?: string;
  nationality?: string;
  gender?: string;
  isPep?: string;
  pepDetails?: string;
  passportPhoto?: string;
  signatureImage?: string;
  idDocument?: string;
  signingClass?: string;
}

export interface CorporateRegistration {
  id: string;
  businessName: string;
  rcNumber: string;
  dateSubmitted: string;
  dateIncorporated: string;
  representativeName: string;
  representativeEmail: string;
  representativePhone: string;
  registeredAddress: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  kycProgress: number; // Out of 10
  documents: CorporateDocument[];
  directors: CorporateDirector[];
  adminNotes?: string;
  dateReviewed?: string;

  // Shariah Company Profile details (as in company profile tab)
  natureOfBusiness?: string;
  tin?: string;
  entityType?: string;
  annualTurnover?: string;
  sourceOfFunds?: string;
  clientSegmentation?: string;
  companyPhone?: string;
  companyEmail?: string;

  // Linked Settlement Accounts
  nairaAccounts?: SettlementNairaAccount[];
  domiciliaryAccounts?: SettlementDomiciliaryAccount[];

  // Primary Contact Person
  contactPerson?: CorporateDirector;
}

@Component({
  selector: 'app-admin-corporate-hub',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, BadgeComponent],
  templateUrl: './corporate-hub.component.html',
  styleUrl: './corporate-hub.component.css'
})
export class CorporateHubComponent implements OnInit {
  // State Signals
  registrations = signal<CorporateRegistration[]>([]);
  selectedRegistration = signal<CorporateRegistration | null>(null);
  selectedDirector = signal<CorporateDirector | null>(null);
  showDetailDrawer = signal(false);
  showDossierModal = signal(false);
  rejectionReason = signal('');
  isProcessing = signal(false);
  
  // Search & Filtering Signals
  activeFilter = signal<'pending' | 'verified'>('pending');
  searchQuery = signal('');
  
  // Custom Document Preview Mockup Signal
  activeDocPreview = signal<{ docName: string; fileName: string; type: string; rcNumber?: string; businessName?: string } | null>(null);

  isAllDocumentsVerified = computed(() => {
    const selected = this.selectedRegistration();
    if (!selected) return false;
    return selected.documents.every(d => d.status === 'verified');
  });

  // Pagination
  currentPage = signal(1);
  pageSize = signal(10);

  isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  ngOnInit() {
    this.loadRegistrations();
  }

  loadRegistrations() {
    if (!this.isBrowser()) {
      return;
    }

    const saved = localStorage.getItem('admin_corporate_registrations');
    if (saved) {
      try {
        this.registrations.set(JSON.parse(saved));
        return;
      } catch (e) {
        console.error('Error parsing corporate registrations', e);
      }
    }

    // Default High-Fidelity Dummy Corporate registrations
    const defaults: CorporateRegistration[] = [
      {
        id: 'CORP-8294',
        businessName: 'Halal Invest Ltd',
        rcNumber: 'RC-746392',
        dateSubmitted: 'May 24, 2026',
        dateIncorporated: 'Nov 12, 2018',
        representativeName: 'Aisha Musa',
        representativeEmail: 'aisha.musa@halalinvest.com',
        representativePhone: '+234 812 345 6789',
        registeredAddress: '12, Medina Crescent, Victoria Island, Lagos',
        status: 'Pending',
        kycProgress: 8,
        natureOfBusiness: 'Islamic FinTech & Microfinance Services',
        tin: '21092847-0001',
        entityType: 'Private Limited Company',
        annualTurnover: '₦250M - ₦1B',
        sourceOfFunds: 'Retained Earnings & Equity Capital',
        clientSegmentation: 'Corporate Premium Client',
        companyPhone: '+234 812 345 6789',
        companyEmail: 'compliance@halalinvest.com',
        nairaAccounts: [
          { bankName: 'Jaiz Bank', accountNumber: '0019284710', accountName: 'Halal Invest Ltd - Premium Reserves', bankBranch: 'Victoria Island Branch, Lagos', isDefault: true }
        ],
        domiciliaryAccounts: [
          { bankName: 'Lotus Bank', accountNumber: '2001928374', accountName: 'Halal Invest Ltd - Reserves USD', correspondentBank: 'Lotus Bank Ltd', sortCode: '3020149', swiftCode: 'LOTUNGAXXX', beneficiaryAccountName: 'Halal Invest Ltd', beneficiaryAccountNo: '2001928374', isDefault: true }
        ],
        contactPerson: {
          name: 'Aisha Musa',
          role: 'Managing Director / CEO',
          shareholding: 40,
          idType: 'NIN (National ID)',
          idNumber: 'NIN-893049281',
          status: 'Verified',
          title: 'Mrs',
          surname: 'Musa',
          firstName: 'Aisha',
          otherNames: 'Kamilah',
          dob: '1988-06-18',
          email: 'aisha.musa@halalinvest.com',
          phone: '+234 812 345 6789',
          bvn: '22194857102',
          residentialAddress: '12, Medina Crescent, Victoria Island, Lagos',
          nationality: 'Nigerian',
          gender: 'Female',
          isPep: 'No',
          pepDetails: '',
          passportPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256',
          signatureImage: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Foreman_Signature.png',
          idDocument: 'https://images.unsplash.com/photo-1554774853-719586f82d77?q=80&w=400',
          signingClass: 'A'
        },
        documents: [
          { name: '1. Completed Application Form', type: 'appForm', status: 'verified', fileName: 'Completed_App_Form_Sign.pdf', fileSize: '1.4 MB', dateUploaded: 'May 24, 2026' },
          { name: '2. Certificate of Incorporation', type: 'incorporation', status: 'verified', fileName: 'CAC_Incorporation_Cert.pdf', fileSize: '850 KB', dateUploaded: 'May 24, 2026' },
          { name: '3. Passport Photography of each Authorized Signatory', type: 'passport', status: 'verified', fileName: 'Aisha_Musa_Passport.jpg', fileSize: '240 KB', dateUploaded: 'May 24, 2026' },
          { name: '4. Memorandum & Articles of Association', type: 'memart', status: 'verified', fileName: 'Memart_Approved.pdf', fileSize: '3.2 MB', dateUploaded: 'May 24, 2026' },
          { name: '5. Form CAC 2 (Return of Allotment of Shares)', type: 'cac2', status: 'pending', fileName: 'CAC_Form2_Allotment.pdf', fileSize: '1.1 MB', dateUploaded: 'May 25, 2026' },
          { name: '6. Form CAC 7 (Particulars of Directors)', type: 'cac7', status: 'pending', fileName: 'CAC_Form7_Directors.pdf', fileSize: '980 KB', dateUploaded: 'May 25, 2026' },
          { name: '7. Form CAC 3 (Registered Address Notice)', type: 'cac3', status: 'verified', fileName: 'CAC_Form3_RegisteredAddress.pdf', fileSize: '1.0 MB', dateUploaded: 'May 24, 2026' },
          { name: '8. Copy of Identification of Signatories and Directors', type: 'signatoryId', status: 'verified', fileName: 'Aisha_Musa_NIN.jpg', fileSize: '480 KB', dateUploaded: 'May 24, 2026' },
          { name: '9. Board Resolution confirming Signatories', type: 'boardResolution', status: 'verified', fileName: 'Board_Resolution_Signatories.pdf', fileSize: '720 KB', dateUploaded: 'May 24, 2026' },
          { name: '10. Link Settlement Bank Account', type: 'settlementLink', status: 'verified', fileName: 'Jaiz_Bank_Settlement_Letter.pdf', fileSize: '520 KB', dateUploaded: 'May 26, 2026' }
        ],
        directors: [
          {
            name: 'Aisha Musa',
            role: 'Managing Director / CEO',
            shareholding: 40,
            idType: 'NIN (National ID)',
            idNumber: 'NIN-893049281',
            status: 'Verified',
            title: 'Mrs',
            surname: 'Musa',
            firstName: 'Aisha',
            otherNames: 'Kamilah',
            dob: '1988-06-18',
            email: 'aisha.musa@halalinvest.com',
            phone: '+234 812 345 6789',
            bvn: '22194857102',
            residentialAddress: '12, Medina Crescent, Victoria Island, Lagos',
            nationality: 'Nigerian',
            gender: 'Female',
            isPep: 'No',
            pepDetails: '',
            passportPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256',
            signatureImage: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Foreman_Signature.png',
            idDocument: 'https://images.unsplash.com/photo-1554774853-719586f82d77?q=80&w=400',
            signingClass: 'A'
          },
          {
            name: 'Ibrahim Kazeem',
            role: 'Operations Director',
            shareholding: 30,
            idType: 'International Passport',
            idNumber: 'PP-A0932849',
            status: 'Verified',
            title: 'Mr',
            surname: 'Kazeem',
            firstName: 'Ibrahim',
            otherNames: 'Kunle',
            dob: '1984-10-05',
            email: 'ibrahim@halalinvest.com',
            phone: '+234 803 777 8899',
            bvn: '22147859301',
            residentialAddress: 'Plot 48, Cocoa Industrial Zone, Ikeja, Lagos',
            nationality: 'Nigerian',
            gender: 'Male',
            isPep: 'No',
            pepDetails: '',
            passportPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256',
            signatureImage: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Foreman_Signature.png',
            idDocument: 'https://images.unsplash.com/photo-1554774853-719586f82d77?q=80&w=400',
            signingClass: 'A'
          },
          {
            name: 'Fatimah Yusuf',
            role: 'Finance Director',
            shareholding: 30,
            idType: 'Driver\'s License',
            idNumber: 'DL-KD93201K9',
            status: 'Verified',
            title: 'Mrs',
            surname: 'Yusuf',
            firstName: 'Fatimah',
            otherNames: 'Amina',
            dob: '1991-03-24',
            email: 'fatimah@halalinvest.com',
            phone: '+234 701 999 0000',
            bvn: '22384710928',
            residentialAddress: '15 Lekki Phase 1, Lagos',
            nationality: 'Nigerian',
            gender: 'Female',
            isPep: 'No',
            pepDetails: '',
            passportPhoto: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=256',
            signatureImage: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Foreman_Signature.png',
            idDocument: 'https://images.unsplash.com/photo-1554774853-719586f82d77?q=80&w=400',
            signingClass: 'B'
          }
        ]
      },
      {
        id: 'CORP-3940',
        businessName: 'Medina Agro Allied Corp',
        rcNumber: 'RC-893472',
        dateSubmitted: 'May 25, 2026',
        dateIncorporated: 'Jul 04, 2020',
        representativeName: 'Ibrahim Kazeem',
        representativeEmail: 'ibrahim@medinaagro.com',
        representativePhone: '+234 803 777 8899',
        registeredAddress: 'Plot 48, Cocoa Industrial Zone, Ikeja, Lagos',
        status: 'Pending',
        kycProgress: 10,
        natureOfBusiness: 'Sustainable Organic Farming & Agro-Distribution',
        tin: '22091837-0002',
        entityType: 'Private Limited Company',
        annualTurnover: '₦50M - ₦250M',
        sourceOfFunds: 'Retained Earnings & Partner Capital',
        clientSegmentation: 'Corporate Reserve Client',
        companyPhone: '+234 803 777 8899',
        companyEmail: 'info@medinaagro.com',
        nairaAccounts: [
          { bankName: 'Sterling Alternative Finance', accountNumber: '1093847291', accountName: 'Medina Agro Allied Corp', bankBranch: 'Ikeja Branch, Lagos', isDefault: true }
        ],
        domiciliaryAccounts: [],
        contactPerson: {
          name: 'Ibrahim Kazeem',
          role: 'Chairman / Founder',
          shareholding: 75,
          idType: 'International Passport',
          idNumber: 'PP-B8394029',
          status: 'Verified',
          title: 'Mr',
          surname: 'Kazeem',
          firstName: 'Ibrahim',
          otherNames: 'Kunle',
          dob: '1984-10-05',
          email: 'ibrahim@medinaagro.com',
          phone: '+234 803 777 8899',
          bvn: '22147859301',
          residentialAddress: 'Plot 48, Cocoa Industrial Zone, Ikeja, Lagos',
          nationality: 'Nigerian',
          gender: 'Male',
          isPep: 'No',
          pepDetails: '',
          passportPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256',
          signatureImage: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Foreman_Signature.png',
          idDocument: 'https://images.unsplash.com/photo-1554774853-719586f82d77?q=80&w=400',
          signingClass: 'A'
        },
        documents: [
          { name: '1. Completed Application Form', type: 'appForm', status: 'verified', fileName: 'Medina_AppForm_Completed.pdf', fileSize: '1.8 MB', dateUploaded: 'May 25, 2026' },
          { name: '2. Certificate of Incorporation', type: 'incorporation', status: 'verified', fileName: 'Medina_Incorporation_CAC.pdf', fileSize: '910 KB', dateUploaded: 'May 25, 2026' },
          { name: '3. Passport Photography of each Authorized Signatory', type: 'passport', status: 'verified', fileName: 'Kazeem_Passport_Photo.png', fileSize: '310 KB', dateUploaded: 'May 25, 2026' },
          { name: '4. Memorandum & Articles of Association', type: 'memart', status: 'verified', fileName: 'Medina_Memart.pdf', fileSize: '2.7 MB', dateUploaded: 'May 25, 2026' },
          { name: '5. Form CAC 2 (Return of Allotment of Shares)', type: 'cac2', status: 'verified', fileName: 'Medina_CAC_Form2.pdf', fileSize: '1.2 MB', dateUploaded: 'May 25, 2026' },
          { name: '6. Form CAC 7 (Particulars of Directors)', type: 'cac7', status: 'verified', fileName: 'Medina_CAC_Form7.pdf', fileSize: '1.0 MB', dateUploaded: 'May 25, 2026' },
          { name: '7. Form CAC 3 (Registered Address Notice)', type: 'cac3', status: 'verified', fileName: 'Medina_CAC_Form3.pdf', fileSize: '850 KB', dateUploaded: 'May 25, 2026' },
          { name: '8. Copy of Identification of Signatories and Directors', type: 'signatoryId', status: 'verified', fileName: 'Kazeem_Passport_Scan.pdf', fileSize: '650 KB', dateUploaded: 'May 25, 2026' },
          { name: '9. Board Resolution confirming Signatories', type: 'boardResolution', status: 'verified', fileName: 'Medina_Board_Resolution.pdf', fileSize: '580 KB', dateUploaded: 'May 25, 2026' },
          { name: '10. Link Settlement Bank Account', type: 'settlementLink', status: 'verified', fileName: 'Lotus_Bank_Letter.pdf', fileSize: '440 KB', dateUploaded: 'May 25, 2026' }
        ],
        directors: [
          {
            name: 'Ibrahim Kazeem',
            role: 'Chairman / Founder',
            shareholding: 75,
            idType: 'International Passport',
            idNumber: 'PP-B8394029',
            status: 'Verified',
            title: 'Mr',
            surname: 'Kazeem',
            firstName: 'Ibrahim',
            otherNames: 'Kunle',
            dob: '1984-10-05',
            email: 'ibrahim@medinaagro.com',
            phone: '+234 803 777 8899',
            bvn: '22147859301',
            residentialAddress: 'Plot 48, Cocoa Industrial Zone, Ikeja, Lagos',
            nationality: 'Nigerian',
            gender: 'Male',
            isPep: 'No',
            pepDetails: '',
            passportPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256',
            signatureImage: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Foreman_Signature.png',
            idDocument: 'https://images.unsplash.com/photo-1554774853-719586f82d77?q=80&w=400',
            signingClass: 'A'
          },
          {
            name: 'Rashidat Kazeem',
            role: 'Executive Director',
            shareholding: 25,
            idType: 'NIN (National ID)',
            idNumber: 'NIN-392049281',
            status: 'Verified',
            title: 'Mrs',
            surname: 'Kazeem',
            firstName: 'Rashidat',
            otherNames: 'Kemi',
            dob: '1989-12-14',
            email: 'rashidat@medinaagro.com',
            phone: '+234 803 777 8890',
            bvn: '22394029104',
            residentialAddress: 'Plot 48, Cocoa Industrial Zone, Ikeja, Lagos',
            nationality: 'Nigerian',
            gender: 'Female',
            isPep: 'No',
            pepDetails: '',
            passportPhoto: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=256',
            signatureImage: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Foreman_Signature.png',
            idDocument: 'https://images.unsplash.com/photo-1554774853-719586f82d77?q=80&w=400',
            signingClass: 'B'
          }
        ]
      },
      {
        id: 'CORP-1094',
        businessName: 'An-Nur Shariah Foundation',
        rcNumber: 'RC-554892',
        dateSubmitted: 'May 20, 2026',
        dateIncorporated: 'Mar 15, 2015',
        representativeName: 'Fatimah Yusuf',
        representativeEmail: 'contact@annur.org',
        representativePhone: '+234 701 999 0000',
        registeredAddress: '15, An-Nur Islamic Center Way, Abuja FCT',
        status: 'Verified',
        kycProgress: 10,
        natureOfBusiness: 'Shariah Education & Community Development',
        tin: '23094827-0003',
        entityType: 'Registered Trustees',
        annualTurnover: '₦10M - ₦50M',
        sourceOfFunds: 'Donations & Waqf Endowment',
        clientSegmentation: 'Institutional NGO Client',
        companyPhone: '+234 701 999 0000',
        companyEmail: 'trustees@annur.org',
        nairaAccounts: [
          { bankName: 'Jaiz Bank', accountNumber: '0029384710', accountName: 'An-Nur Shariah Foundation - Waqf', bankBranch: 'Wuse Branch, Abuja', isDefault: true }
        ],
        domiciliaryAccounts: [],
        contactPerson: {
          name: 'Fatimah Yusuf',
          role: 'Secretary / Trustee',
          shareholding: 0,
          idType: 'International Passport',
          idNumber: 'PP-C0328491',
          status: 'Verified',
          title: 'Mrs',
          surname: 'Yusuf',
          firstName: 'Fatimah',
          otherNames: 'Amina',
          dob: '1991-03-24',
          email: 'contact@annur.org',
          phone: '+234 701 999 0000',
          bvn: '22384710928',
          residentialAddress: '15, An-Nur Islamic Center Way, Abuja FCT',
          nationality: 'Nigerian',
          gender: 'Female',
          isPep: 'No',
          pepDetails: '',
          passportPhoto: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=256',
          signatureImage: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Foreman_Signature.png',
          idDocument: 'https://images.unsplash.com/photo-1554774853-719586f82d77?q=80&w=400',
          signingClass: 'B'
        },
        documents: [
          { name: '1. Completed Application Form', type: 'appForm', status: 'verified', fileName: 'AnNur_AppForm.pdf', fileSize: '1.2 MB', dateUploaded: 'May 20, 2026' },
          { name: '2. Certificate of Incorporation', type: 'incorporation', status: 'verified', fileName: 'AnNur_Certificate.pdf', fileSize: '790 KB', dateUploaded: 'May 20, 2026' },
          { name: '3. Passport Photography of each Authorized Signatory', type: 'passport', status: 'verified', fileName: 'Fatimah_Passport.png', fileSize: '180 KB', dateUploaded: 'May 20, 2026' },
          { name: '4. Memorandum & Articles of Association', type: 'memart', status: 'verified', fileName: 'AnNur_Articles.pdf', fileSize: '2.1 MB', dateUploaded: 'May 20, 2026' },
          { name: '5. Form CAC 2 (Return of Allotment of Shares)', type: 'cac2', status: 'verified', fileName: 'AnNur_CAC2.pdf', fileSize: '950 KB', dateUploaded: 'May 20, 2026' },
          { name: '6. Form CAC 7 (Particulars of Directors)', type: 'cac7', status: 'verified', fileName: 'AnNur_CAC7.pdf', fileSize: '880 KB', dateUploaded: 'May 20, 2026' },
          { name: '7. Form CAC 3 (Registered Address Notice)', type: 'cac3', status: 'verified', fileName: 'AnNur_CAC3.pdf', fileSize: '740 KB', dateUploaded: 'May 20, 2026' },
          { name: '8. Copy of Identification of Signatories and Directors', type: 'signatoryId', status: 'verified', fileName: 'Fatimah_NIN_Scan.jpg', fileSize: '320 KB', dateUploaded: 'May 20, 2026' },
          { name: '9. Board Resolution confirming Signatories', type: 'boardResolution', status: 'verified', fileName: 'AnNur_BoardResolution.pdf', fileSize: '490 KB', dateUploaded: 'May 20, 2026' },
          { name: '10. Link Settlement Bank Account', type: 'settlementLink', status: 'verified', fileName: 'JaizBank_AnNur_Settlement.pdf', fileSize: '390 KB', dateUploaded: 'May 20, 2026' }
        ],
        directors: [
          {
            name: 'Ustaz Ahmed Bello',
            role: 'Chairman / Trustee',
            shareholding: 0,
            idType: 'NIN (National ID)',
            idNumber: 'NIN-193049281',
            status: 'Verified',
            title: 'Ustaz',
            surname: 'Bello',
            firstName: 'Ahmed',
            otherNames: 'Saeed',
            dob: '1970-01-15',
            email: 'ahmed@annur.org',
            phone: '+234 701 999 0001',
            bvn: '22119304928',
            residentialAddress: '15, An-Nur Islamic Center Way, Abuja FCT',
            nationality: 'Nigerian',
            gender: 'Male',
            isPep: 'No',
            pepDetails: '',
            passportPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256',
            signatureImage: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Foreman_Signature.png',
            idDocument: 'https://images.unsplash.com/photo-1554774853-719586f82d77?q=80&w=400',
            signingClass: 'A'
          },
          {
            name: 'Fatimah Yusuf',
            role: 'Secretary / Trustee',
            shareholding: 0,
            idType: 'International Passport',
            idNumber: 'PP-C0328491',
            status: 'Verified',
            title: 'Mrs',
            surname: 'Yusuf',
            firstName: 'Fatimah',
            otherNames: 'Amina',
            dob: '1991-03-24',
            email: 'contact@annur.org',
            phone: '+234 701 999 0000',
            bvn: '22384710928',
            residentialAddress: '15, An-Nur Islamic Center Way, Abuja FCT',
            nationality: 'Nigerian',
            gender: 'Female',
            isPep: 'No',
            pepDetails: '',
            passportPhoto: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=256',
            signatureImage: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Foreman_Signature.png',
            idDocument: 'https://images.unsplash.com/photo-1554774853-719586f82d77?q=80&w=400',
            signingClass: 'B'
          }
        ],
        dateReviewed: 'May 22, 2026',
        adminNotes: 'All CAC verifications correspond directly with the government corporate registry. Board resolution and Jaiz bank settlement account fully verified.'
      },
      {
        id: 'CORP-5739',
        businessName: 'Zaytuna Real Estate Ltd',
        rcNumber: 'RC-302482',
        dateSubmitted: 'May 22, 2026',
        dateIncorporated: 'Jan 10, 2022',
        representativeName: 'Yusuf Tariq',
        representativeEmail: 'yusuf@zaytunarealestate.com',
        representativePhone: '+234 905 111 2222',
        registeredAddress: 'Block C, Zaytuna Plaza, Lekki Phase 1, Lagos',
        status: 'Pending',
        kycProgress: 5,
        natureOfBusiness: 'Shariah-Compliant Property Acquisition & Real Estate',
        tin: '24098273-0004',
        entityType: 'Private Limited Company',
        annualTurnover: '₦250M - ₦1B',
        sourceOfFunds: 'Equity & Real Estate Investment Placements',
        clientSegmentation: 'Corporate Premium Client',
        companyPhone: '+234 905 111 2222',
        companyEmail: 'invest@zaytunarealestate.com',
        nairaAccounts: [
          { bankName: 'Taj Bank', accountNumber: '1002938471', accountName: 'Zaytuna Real Estate Ltd', bankBranch: 'Lekki Phase 1 Branch, Lagos', isDefault: true }
        ],
        domiciliaryAccounts: [
          { bankName: 'Jaiz Bank', accountNumber: '0092837461', accountName: 'Zaytuna Real Estate Ltd - Domiciliary', correspondentBank: 'Jaiz Bank PLC', sortCode: '3010189', swiftCode: 'JAIZNGAXXX', beneficiaryAccountName: 'Zaytuna Real Estate Ltd', beneficiaryAccountNo: '0092837461', isDefault: true }
        ],
        contactPerson: {
          name: 'Yusuf Tariq',
          role: 'Managing Director',
          shareholding: 50,
          idType: 'NIN (National ID)',
          idNumber: 'NIN-593029104',
          status: 'Verified',
          title: 'Mr',
          surname: 'Tariq',
          firstName: 'Yusuf',
          otherNames: 'Alabi',
          dob: '1985-04-12',
          email: 'yusuf@zaytunarealestate.com',
          phone: '+234 905 111 2222',
          bvn: '22194857102',
          residentialAddress: 'Block C, Zaytuna Plaza, Lekki Phase 1, Lagos',
          nationality: 'Nigerian',
          gender: 'Male',
          isPep: 'No',
          pepDetails: '',
          passportPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256',
          signatureImage: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Foreman_Signature.png',
          idDocument: 'https://images.unsplash.com/photo-1554774853-719586f82d77?q=80&w=400',
          signingClass: 'A'
        },
        documents: [
          { name: '1. Completed Application Form', type: 'appForm', status: 'verified', fileName: 'Zaytuna_AppForm_Signed.pdf', fileSize: '1.5 MB', dateUploaded: 'May 22, 2026' },
          { name: '2. Certificate of Incorporation', type: 'incorporation', status: 'verified', fileName: 'Zaytuna_Incorporation_Cert.pdf', fileSize: '810 KB', dateUploaded: 'May 22, 2026' },
          { name: '3. Passport Photography of each Authorized Signatory', type: 'passport', status: 'pending', fileName: 'Tariq_Passport.jpg', fileSize: '210 KB', dateUploaded: 'May 23, 2026' },
          { name: '4. Memorandum & Articles of Association', type: 'memart', status: 'pending', fileName: 'Zaytuna_Memart.pdf', fileSize: '3.0 MB', dateUploaded: 'May 23, 2026' },
          { name: '5. Form CAC 2 (Return of Allotment of Shares)', type: 'cac2', status: 'unverified', fileName: '', fileSize: 'N/A', dateUploaded: 'N/A' },
          { name: '6. Form CAC 7 (Particulars of Directors)', type: 'cac7', status: 'unverified', fileName: '', fileSize: 'N/A', dateUploaded: 'N/A' },
          { name: '7. Form CAC 3 (Registered Address Notice)', type: 'cac3', status: 'verified', fileName: 'Zaytuna_CAC_Form3.pdf', fileSize: '920 KB', dateUploaded: 'May 22, 2026' },
          { name: '8. Copy of Identification of Signatories and Directors', type: 'signatoryId', status: 'verified', fileName: 'Tariq_NIN_Copy.png', fileSize: '410 KB', dateUploaded: 'May 22, 2026' },
          { name: '9. Board Resolution confirming Signatories', type: 'boardResolution', status: 'unverified', fileName: '', fileSize: 'N/A', dateUploaded: 'N/A' },
          { name: '10. Link Settlement Bank Account', type: 'settlementLink', status: 'unverified', fileName: '', fileSize: 'N/A', dateUploaded: 'N/A' }
        ],
        directors: [
          {
            name: 'Yusuf Tariq',
            role: 'Managing Director',
            shareholding: 50,
            idType: 'NIN (National ID)',
            idNumber: 'NIN-593029104',
            status: 'Verified',
            title: 'Mr',
            surname: 'Tariq',
            firstName: 'Yusuf',
            otherNames: 'Alabi',
            dob: '1985-04-12',
            email: 'yusuf@zaytunarealestate.com',
            phone: '+234 905 111 2222',
            bvn: '22194857102',
            residentialAddress: 'Block C, Zaytuna Plaza, Lekki Phase 1, Lagos',
            nationality: 'Nigerian',
            gender: 'Male',
            isPep: 'No',
            pepDetails: '',
            passportPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256',
            signatureImage: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Foreman_Signature.png',
            idDocument: 'https://images.unsplash.com/photo-1554774853-719586f82d77?q=80&w=400',
            signingClass: 'A'
          },
          {
            name: 'Tariq Al-Mansoor',
            role: 'Executive Partner',
            shareholding: 50,
            idType: 'International Passport',
            idNumber: 'PP-X9834920',
            status: 'Pending',
            title: 'Mr',
            surname: 'Al-Mansoor',
            firstName: 'Tariq',
            otherNames: 'Fahad',
            dob: '1979-05-15',
            email: 'tariq.mansoor@zaytunarealestate.com',
            phone: '+234 905 111 2223',
            bvn: '22194857123',
            residentialAddress: 'Block C, Zaytuna Plaza, Lekki Phase 1, Lagos',
            nationality: 'Nigerian',
            gender: 'Male',
            isPep: 'Yes',
            pepDetails: 'Relative of government director',
            passportPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256',
            signatureImage: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Foreman_Signature.png',
            idDocument: 'https://images.unsplash.com/photo-1554774853-719586f82d77?q=80&w=400',
            signingClass: 'A'
          }
        ]
      }
    ];

    // Check if there is a local corporate profile created by the corporate settings or registration
    // Let's add it to the list dynamically so if they register a corporate account, it is visible!
    const localUserStr = localStorage.getItem('dogo_user');
    const localVerifStr = localStorage.getItem('corporate_verifications');
    const localNairaStr = localStorage.getItem('corporate_naira_accounts');
    const localDomStr = localStorage.getItem('corporate_dom_accounts');
    
    if (localUserStr) {
      try {
        const localUser = JSON.parse(localUserStr);
        // Verify it represents a corporate account
        const role = localUser.role || localUser.Role || localUser.userRole || localUser.UserRole || '';
        if (role.toLowerCase() === 'corporate' || localUser.businessName || localUser.BusinessName) {
          const bizName = localUser.businessName || localUser.BusinessName || 'Bayero Corporate Reserves Ltd';
          const rEmail = localUser.email || localUser.Email || 'ado.bayero@bayerocorp.com';
          const rName = `${localUser.firstName || localUser.FirstName || 'Ado'} ${localUser.lastName || localUser.LastName || 'Bayero'}`;
          
          let verifs = [];
          if (localVerifStr) {
            verifs = JSON.parse(localVerifStr);
          }
          
          let naira = [];
          if (localNairaStr) {
            try { naira = JSON.parse(localNairaStr); } catch(e) {}
          }
          if (naira.length === 0) {
            naira = [
              { bankName: 'Sterling Alternative Finance', accountNumber: '1093847291', accountName: bizName + ' - Reserves NGN', bankBranch: 'Lagos Main Branch', isDefault: true }
            ];
          }

          let dom = [];
          if (localDomStr) {
            try { dom = JSON.parse(localDomStr); } catch(e) {}
          }
          if (dom.length === 0) {
            dom = [
              { bankName: 'Lotus Bank', accountNumber: '2001928374', accountName: bizName + ' - Reserves USD', correspondentBank: 'Lotus Bank Ltd', sortCode: '3020149', swiftCode: 'LOTUNGAXXX', beneficiaryAccountName: bizName, beneficiaryAccountNo: '2001928374', isDefault: true }
            ];
          }

          // Build realistic document state mapping
          const docList: CorporateDocument[] = [
            { name: '1. Completed Application Form', type: 'appForm', status: 'verified', fileName: 'Completed_App_Form_Sign.pdf', fileSize: '1.2 MB', dateUploaded: 'May 26, 2026' },
            { name: '2. Certificate of Incorporation', type: 'incorporation', status: 'verified', fileName: 'CAC_Incorporation_Cert.pdf', fileSize: '980 KB', dateUploaded: 'May 26, 2026' },
            { name: '3. Passport Photography of each Authorized Signatory', type: 'passport', status: this.mapStatus(verifs, 'passport'), fileName: 'Rep_Passport.jpg', fileSize: '210 KB', dateUploaded: 'May 26, 2026' },
            { name: '4. Memorandum & Articles of Association', type: 'memart', status: 'verified', fileName: 'Memart_Approved.pdf', fileSize: '2.8 MB', dateUploaded: 'May 26, 2026' },
            { name: '5. Form CAC 2 (Return of Allotment of Shares)', type: 'cac2', status: this.mapStatus(verifs, 'cac2'), fileName: 'CAC_Form2_Allotment.pdf', fileSize: '1.1 MB', dateUploaded: 'May 26, 2026' },
            { name: '6. Form CAC 7 (Particulars of Directors)', type: 'cac7', status: this.mapStatus(verifs, 'cac7'), fileName: 'CAC_Form7_Directors.pdf', fileSize: '950 KB', dateUploaded: 'May 26, 2026' },
            { name: '7. Form CAC 3 (Registered Address Notice)', type: 'cac3', status: this.mapStatus(verifs, 'cac3'), fileName: 'CAC_Form3_RegisteredAddress.pdf', fileSize: '1.0 MB', dateUploaded: 'May 26, 2026' },
            { name: '8. Copy of Identification of Signatories and Directors', type: 'signatoryId', status: this.mapStatus(verifs, 'signatoryId'), fileName: 'Rep_NIN_Scan.jpg', fileSize: '440 KB', dateUploaded: 'May 26, 2026' },
            { name: '9. Board Resolution confirming Signatories', type: 'boardResolution', status: this.mapStatus(verifs, 'boardResolution'), fileName: 'Board_Resolution_Signatories.pdf', fileSize: '680 KB', dateUploaded: 'May 26, 2026' },
            { name: '10. Link Settlement Bank Account', type: 'settlementLink', status: (naira.length > 0 || dom.length > 0) ? 'verified' : 'unverified', fileName: naira.length > 0 ? 'Settlement_Bank_Account.pdf' : '', fileSize: naira.length > 0 ? '380 KB' : 'N/A', dateUploaded: naira.length > 0 ? 'May 27, 2026' : 'N/A' }
          ];

          const completedCount = docList.filter(d => d.status === 'verified').length;

          const localCompany: CorporateRegistration = {
            id: 'CORP-7729',
            businessName: bizName,
            rcNumber: 'RC-998014',
            dateSubmitted: 'May 26, 2026',
            dateIncorporated: 'Feb 18, 2021',
            representativeName: rName,
            representativeEmail: rEmail,
            representativePhone: '+234 812 000 1122',
            registeredAddress: '22 Alhaji Kanike Close, Off Awolowo Road, Ikoyi, Lagos',
            status: 'Pending',
            kycProgress: completedCount,
            documents: docList,
            natureOfBusiness: 'Commodity Trading & Asset Placements',
            tin: '21092847-0001',
            entityType: 'Private Limited Company',
            annualTurnover: '₦100M - ₦499.9M',
            sourceOfFunds: 'Corporate Reserves & Retained Business Inflow',
            clientSegmentation: 'Corporate Premium Client',
            companyPhone: '0801 234 5678',
            companyEmail: 'ado.bayero@bayerocorp.com',
            nairaAccounts: naira,
            domiciliaryAccounts: dom,
            contactPerson: {
              name: 'Malik Sherifdeen',
              role: 'Managing Director / Authorized Rep',
              shareholding: 50,
              idType: 'NIN (National ID)',
              idNumber: 'NIN-193049281',
              status: 'Verified',
              title: 'Mr',
              surname: 'Sherifdeen',
              firstName: 'Malik',
              otherNames: 'Alabi',
              dob: '1985-04-12',
              email: 'malik@bayerocorp.com',
              phone: '0803 123 4567',
              bvn: '22194857102',
              residentialAddress: '22 Alhaji Kanike Close, Off Awolowo Road, Ikoyi, Lagos',
              nationality: 'Nigerian',
              gender: 'Male',
              isPep: 'No',
              pepDetails: '',
              passportPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256',
              signatureImage: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Foreman_Signature.png',
              idDocument: 'https://images.unsplash.com/photo-1554774853-719586f82d77?q=80&w=400',
              signingClass: 'A'
            },
            directors: [
              {
                name: 'Malik Sherifdeen',
                role: 'Managing Director / Authorized Rep',
                shareholding: 50,
                idType: 'NIN (National ID)',
                idNumber: 'NIN-193049281',
                status: 'Verified',
                title: 'Mr',
                surname: 'Sherifdeen',
                firstName: 'Malik',
                otherNames: 'Alabi',
                dob: '1985-04-12',
                email: 'malik@bayerocorp.com',
                phone: '0803 123 4567',
                bvn: '22194857102',
                residentialAddress: '22 Alhaji Kanike Close, Off Awolowo Road, Ikoyi, Lagos',
                nationality: 'Nigerian',
                gender: 'Male',
                isPep: 'No',
                pepDetails: '',
                passportPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256',
                signatureImage: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Foreman_Signature.png',
                idDocument: 'https://images.unsplash.com/photo-1554774853-719586f82d77?q=80&w=400',
                signingClass: 'A'
              },
              {
                name: 'Ado Bayero',
                role: 'Chairman / Controlling Director',
                shareholding: 25,
                idType: 'National ID Card',
                idNumber: '984712048591',
                status: 'Verified',
                title: 'Mr',
                surname: 'Bayero',
                firstName: 'Ado',
                otherNames: 'Suleiman',
                dob: '1978-08-22',
                email: 'ado@bayerocorp.com',
                phone: '0805 987 6543',
                bvn: '22147859301',
                residentialAddress: 'Plot 45 Gwarinpa Estate, Abuja',
                nationality: 'Nigerian',
                gender: 'Male',
                isPep: 'Yes',
                pepDetails: 'Relative of former local council chairman',
                passportPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256',
                signatureImage: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Foreman_Signature.png',
                idDocument: 'https://images.unsplash.com/photo-1554774853-719586f82d77?q=80&w=400',
                signingClass: 'A'
              },
              {
                name: 'Zainab Bello',
                role: 'Executive Director / Controlling Director',
                shareholding: 25,
                idType: 'Driver\'s License',
                idNumber: 'PP-X8392019',
                status: 'Verified',
                title: 'Mrs',
                surname: 'Bello',
                firstName: 'Zainab',
                otherNames: 'Aisha',
                dob: '1990-11-05',
                email: 'zainab@bayerocorp.com',
                phone: '0812 345 6789',
                bvn: '22384710928',
                residentialAddress: '15 Lekki Phase 1, Lagos',
                nationality: 'Nigerian',
                gender: 'Female',
                isPep: 'No',
                pepDetails: '',
                passportPhoto: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=256',
                signatureImage: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Foreman_Signature.png',
                idDocument: 'https://images.unsplash.com/photo-1554774853-719586f82d77?q=80&w=400',
                signingClass: 'B'
              }
            ]
          };

          // Only push if not already present
          if (!defaults.some(d => d.businessName.toLowerCase() === bizName.toLowerCase())) {
            defaults.unshift(localCompany);
          }
        }
      } catch (e) {
        console.error('Error adding local user to corporate registrations', e);
      }
    }

    this.registrations.set(defaults);
    localStorage.setItem('admin_corporate_registrations', JSON.stringify(defaults));
  }

  private mapStatus(verifs: any[], type: string): 'verified' | 'pending' | 'unverified' {
    if (!verifs || verifs.length === 0) return 'unverified';
    const found = verifs.find(v => v.type === type);
    if (!found) return 'unverified';
    if (found.status === 'verified') return 'verified';
    if (found.status === 'pending') return 'pending';
    return 'unverified';
  }

  // Computed & Filtering Logic
  filteredRegistrations = computed(() => {
    const filter = this.activeFilter();
    const query = this.searchQuery().toLowerCase().trim();
    
    let list = this.registrations().filter(reg => {
      if (filter === 'pending') {
        return reg.status === 'Pending' || reg.status === 'Rejected';
      } else {
        return reg.status === 'Verified';
      }
    });

    if (query) {
      list = list.filter(reg => 
        reg.businessName.toLowerCase().includes(query) ||
        reg.rcNumber.toLowerCase().includes(query) ||
        reg.representativeName.toLowerCase().includes(query) ||
        reg.representativeEmail.toLowerCase().includes(query) ||
        reg.id.toLowerCase().includes(query)
      );
    }

    return list;
  });

  paginatedRegistrations = computed(() => {
    const list = this.filteredRegistrations();
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    return list.slice(startIndex, startIndex + this.pageSize());
  });

  totalPages = computed(() => Math.ceil(this.filteredRegistrations().length / this.pageSize()));
  pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  setFilter(filter: 'pending' | 'verified') {
    this.activeFilter.set(filter);
    this.currentPage.set(1);
  }

  // Pagination Actions
  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  goToPage(page: number) {
    this.currentPage.set(page);
  }

  // Hub Interaction Actions
  viewDetails(reg: CorporateRegistration) {
    this.selectedRegistration.set(reg);
    this.rejectionReason.set(reg.adminNotes || '');
    this.showDetailDrawer.set(true);
  }

  closeDrawer() {
    this.showDetailDrawer.set(false);
    setTimeout(() => {
      this.selectedRegistration.set(null);
      this.activeDocPreview.set(null);
      this.selectedDirector.set(null);
    }, 400);
  }

  closeDossierModal() {
    this.showDossierModal.set(false);
  }

  getInitials(name: string | undefined): string {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    const first = parts[0] ? parts[0].charAt(0) : '';
    const second = parts[1] ? parts[1].charAt(0) : '';
    return (first + second).toUpperCase();
  }

  viewDirectorDetails(dir: CorporateDirector) {
    this.selectedDirector.set(dir);
  }

  closeDirectorDetails() {
    this.selectedDirector.set(null);
  }

  verifyIndividualDocument(doc: CorporateDocument) {
    if (!this.selectedRegistration()) return;
    const selected = this.selectedRegistration()!;
    
    const updatedDocs = selected.documents.map(d => {
      if (d.type === doc.type) {
        return { ...d, status: 'verified' as const, notes: undefined };
      }
      return d;
    });

    const completedCount = updatedDocs.filter(d => d.status === 'verified').length;

    const updatedList = this.registrations().map(reg => {
      if (reg.id === selected.id) {
        return {
          ...reg,
          documents: updatedDocs,
          kycProgress: completedCount
        };
      }
      return reg;
    });

    this.registrations.set(updatedList);
    const updatedSelected = updatedList.find(r => r.id === selected.id) || null;
    this.selectedRegistration.set(updatedSelected);

    if (this.isBrowser()) {
      localStorage.setItem('admin_corporate_registrations', JSON.stringify(updatedList));

      // Dynamic integration for logged in user
      const localUserStr = localStorage.getItem('dogo_user');
      if (localUserStr) {
        try {
          const localUser = JSON.parse(localUserStr);
          const userBizName = localUser.businessName || localUser.BusinessName || '';
          if (userBizName && userBizName.toLowerCase() === selected.businessName.toLowerCase()) {
            const currentVerifs = JSON.parse(localStorage.getItem('corporate_verifications') || '[]');
            const updatedVerifs = currentVerifs.map((v: any) => {
              if (v.type === doc.type) {
                return { ...v, status: 'verified', date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) };
              }
              return v;
            });
            localStorage.setItem('corporate_verifications', JSON.stringify(updatedVerifs));
          }
        } catch(e) {}
      }
    }

    Swal.fire({
      title: 'Document Verified',
      text: `"${doc.name}" has been marked as verified.`,
      icon: 'success',
      confirmButtonColor: '#030E65',
      timer: 1800,
      customClass: {
        popup: 'rounded-[32px]'
      }
    });
  }

  rejectIndividualDocument(doc: CorporateDocument) {
    if (!this.selectedRegistration()) return;
    const selected = this.selectedRegistration()!;

    Swal.fire({
      title: 'Reject Document',
      text: `Enter the reason for rejecting "${doc.name}":`,
      input: 'text',
      inputPlaceholder: 'e.g. Signature missing, expired document, blurred text...',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Confirm Rejection',
      inputValidator: (value: string) => {
        if (!value) {
          return 'You must enter a feedback reason!';
        }
        return null;
      },
      customClass: {
        popup: 'rounded-[32px]'
      }
    }).then((result: any) => {
      if (result.isConfirmed && result.value) {
        const feedback = result.value;

        const updatedDocs = selected.documents.map(d => {
          if (d.type === doc.type) {
            return { ...d, status: 'unverified' as const, notes: feedback };
          }
          return d;
        });

        const completedCount = updatedDocs.filter(d => d.status === 'verified').length;

        const updatedList = this.registrations().map(reg => {
          if (reg.id === selected.id) {
            return {
              ...reg,
              documents: updatedDocs,
              kycProgress: completedCount
            };
          }
          return reg;
        });

        this.registrations.set(updatedList);
        const updatedSelected = updatedList.find(r => r.id === selected.id) || null;
        this.selectedRegistration.set(updatedSelected);

        if (this.isBrowser()) {
          localStorage.setItem('admin_corporate_registrations', JSON.stringify(updatedList));

          // Sync with dynamic logged-in corporate verifications state
          const localUserStr = localStorage.getItem('dogo_user');
          if (localUserStr) {
            try {
              const localUser = JSON.parse(localUserStr);
              const userBizName = localUser.businessName || localUser.BusinessName || '';
              if (userBizName && userBizName.toLowerCase() === selected.businessName.toLowerCase()) {
                const currentVerifs = JSON.parse(localStorage.getItem('corporate_verifications') || '[]');
                const updatedVerifs = currentVerifs.map((v: any) => {
                  if (v.type === doc.type) {
                    return { ...v, status: 'unverified', date: 'N/A' };
                  }
                  return v;
                });
                localStorage.setItem('corporate_verifications', JSON.stringify(updatedVerifs));
              }
            } catch(e) {}
          }
        }

        Swal.fire({
          title: 'Document Flagged',
          text: `"${doc.name}" has been rejected.`,
          icon: 'info',
          confirmButtonColor: '#030E65',
          timer: 1800,
          customClass: {
            popup: 'rounded-[32px]'
          }
        });
      }
    });
  }

  approveRegistration() {
    if (!this.selectedRegistration()) return;
    this.isProcessing.set(true);

    setTimeout(() => {
      const selected = this.selectedRegistration()!;
      const updatedList = this.registrations().map(reg => {
        if (reg.id === selected.id) {
          // Verify all documents in checklist too
          const verifiedDocs = reg.documents.map(d => ({ ...d, status: 'verified' as const }));
          return {
            ...reg,
            status: 'Verified' as const,
            kycProgress: 10,
            documents: verifiedDocs,
            dateReviewed: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            adminNotes: this.rejectionReason() || 'Institutional account verifications validated successfully against registry records.'
          };
        }
        return reg;
      });

      this.registrations.set(updatedList);
      if (this.isBrowser()) {
        localStorage.setItem('admin_corporate_registrations', JSON.stringify(updatedList));
        
        // Dynamic Integration: If this corresponds to the currently logged in corporate account,
        // we can set the dynamic state to full verified so they see the changes instantly!
        const localUserStr = localStorage.getItem('dogo_user');
        if (localUserStr) {
          try {
            const localUser = JSON.parse(localUserStr);
            const userBizName = localUser.businessName || localUser.BusinessName || '';
            if (userBizName && userBizName.toLowerCase() === selected.businessName.toLowerCase()) {
              // Complete all compliance verifications inside the corporate storage!
              const defaultVerifs = [
                { name: '1. Completed Application Form', type: 'appForm', status: 'verified', icon: 'ri-file-list-3-line', date: 'May 26, 2026' },
                { name: '2. Certificate of Incorporation', type: 'incorporation', status: 'verified', icon: 'ri-verified-badge-line', date: 'May 26, 2026' },
                { name: '3. Passport Photography of each Authorized Signatory', type: 'passport', status: 'verified', icon: 'ri-user-line', date: 'May 26, 2026' },
                { name: '4. Memorandum & Articles of Association', type: 'memart', status: 'verified', icon: 'ri-book-read-line', date: 'May 26, 2026' },
                { name: '5. Form CAC 2 (Return of Allotment of Shares)', type: 'cac2', status: 'verified', icon: 'ri-pie-chart-line', date: 'May 26, 2026' },
                { name: '6. Form CAC 7 (Particulars of Directors)', type: 'cac7', status: 'verified', icon: 'ri-folder-user-line', date: 'May 26, 2026' },
                { name: '7. Form CAC 3 (Registered Address Notice)', type: 'cac3', status: 'verified', icon: 'ri-map-pin-user-line', date: 'May 26, 2026' },
                { name: '8. Copy of Identification of Authorized Signatories and Directors', type: 'signatoryId', status: 'verified', icon: 'ri-shield-user-line', date: 'May 26, 2026' },
                { name: '9. Board Resolution/minutes of meeting confirming Authorized Signatories', type: 'boardResolution', status: 'verified', icon: 'ri-team-line', date: 'May 26, 2026' },
                { name: '10. Link Settlement Bank Account', type: 'settlementLink', status: 'verified', icon: 'ri-bank-line', date: 'May 26, 2026' }
              ];
              localStorage.setItem('corporate_verifications', JSON.stringify(defaultVerifs));
            }
          } catch(e) {}
        }
      }

      this.isProcessing.set(false);
      Swal.fire({
        title: 'Account Verified!',
        text: `Corporate Account for ${selected.businessName} has been approved successfully.`,
        icon: 'success',
        confirmButtonColor: '#030E65',
        customClass: {
          popup: 'rounded-[32px]'
        }
      });
      this.closeDrawer();
    }, 1200);
  }

  rejectRegistration() {
    if (!this.selectedRegistration()) return;
    if (!this.rejectionReason().trim()) {
      Swal.fire({
        title: 'Reason Required',
        text: 'Please provide a specific rejection or review reason for the corporate team.',
        icon: 'warning',
        confirmButtonColor: '#030E65',
        customClass: {
          popup: 'rounded-[32px]'
        }
      });
      return;
    }
    
    this.isProcessing.set(true);

    setTimeout(() => {
      const selected = this.selectedRegistration()!;
      const updatedList = this.registrations().map(reg => {
        if (reg.id === selected.id) {
          // Flag some CAC documents as pending or unverified
          const markedDocs = reg.documents.map(d => {
            if (d.type === 'cac2' || d.type === 'cac7') {
              return { ...d, status: 'unverified' as const, notes: 'Invalid CAC Form. Please re-upload current version.' };
            }
            return d;
          });
          return {
            ...reg,
            status: 'Rejected' as const,
            kycProgress: reg.kycProgress > 2 ? reg.kycProgress - 2 : 2,
            documents: markedDocs,
            dateReviewed: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            adminNotes: this.rejectionReason()
          };
        }
        return reg;
      });

      this.registrations.set(updatedList);
      if (this.isBrowser()) {
        localStorage.setItem('admin_corporate_registrations', JSON.stringify(updatedList));

        // Sync with corporate dashboard verifications state if it matches active logged in user
        const localUserStr = localStorage.getItem('dogo_user');
        if (localUserStr) {
          try {
            const localUser = JSON.parse(localUserStr);
            const userBizName = localUser.businessName || localUser.BusinessName || '';
            if (userBizName && userBizName.toLowerCase() === selected.businessName.toLowerCase()) {
              const currentVerifs = JSON.parse(localStorage.getItem('corporate_verifications') || '[]');
              const updatedVerifs = currentVerifs.map((v: any) => {
                if (v.type === 'cac2' || v.type === 'cac7') {
                  return { ...v, status: 'unverified', date: 'N/A' };
                }
                return v;
              });
              localStorage.setItem('corporate_verifications', JSON.stringify(updatedVerifs));
            }
          } catch(e) {}
        }
      }

      this.isProcessing.set(false);
      Swal.fire({
        title: 'Review Flagged',
        text: `Corporate Account review sent to ${selected.businessName} with feedback.`,
        icon: 'info',
        confirmButtonColor: '#030E65',
        customClass: {
          popup: 'rounded-[32px]'
        }
      });
      this.closeDrawer();
    }, 1200);
  }

  // Launch a CSS custom mockup of the document
  triggerDocumentPreview(doc: CorporateDocument) {
    if (doc.status === 'unverified') return;
    const selected = this.selectedRegistration()!;
    this.activeDocPreview.set({
      docName: doc.name,
      fileName: doc.fileName,
      type: doc.type,
      rcNumber: selected.rcNumber,
      businessName: selected.businessName
    });
  }

  closeDocPreview() {
    this.activeDocPreview.set(null);
  }

  getBadgeVariant(status: string): any {
    const s = status.toLowerCase();
    switch (s) {
      case 'verified':
      case 'active':
      case 'approved':
        return 'success';
      case 'pending':
      case 'review':
        return 'warning';
      case 'rejected':
      case 'locked':
      case 'unverified':
        return 'danger';
      default:
        return 'info';
    }
  }
}
