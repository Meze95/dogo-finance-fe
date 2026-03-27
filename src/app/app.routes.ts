import { Routes } from '@angular/router';
import { HomeLayout } from './layouts/home-layout/home-layout';
import { LandingComponent } from './pages/landing/landing.component';
import { FAQComponent } from './pages/faq/faq.component';
import { BlogComponent } from './pages/resources/blog/blog.component';
import { BlogDetailComponent } from './pages/resources/blog-detail/blog-detail.component';
import { CalculatorComponent } from './pages/resources/calculator/calculator.component';
import { ReportsComponent } from './pages/resources/reports/reports.component';
import { EbookComponent } from './pages/resources/ebook/ebook.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeLayout,
    children: [
      { path: '', component: LandingComponent },

      // ---- PRODUCTS (single dynamic component, driven by :plan param) ----
      {
        path: 'products/:plan',
        loadComponent: () => import('./pages/products/products.component').then(m => m.ProductsComponent)
      },

      // ---- TOOLS ----
      {
        path: 'zakat',
        loadComponent: () => import('./pages/zakat/zakat.component').then(m => m.ZakatComponent)
      },
      {
        path: 'goals',
        loadComponent: () => import('./pages/goals/goals.component').then(m => m.GoalsComponent)
      },
      { path: 'savings-calculator', component: CalculatorComponent },

      // ---- COMPANY / TRUST ----
      {
        path: 'shariah',
        loadComponent: () => import('./pages/shariah/shariah.component').then(m => m.ShariahComponent)
      },
      {
        path: 'about',
        loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent)
      },
      {
        path: 'regulatory',
        loadComponent: () => import('./pages/regulatory/regulatory.component').then(m => m.RegulatoryComponent)
      },
      {
        path: 'security',
        loadComponent: () => import('./pages/security/security.component').then(m => m.SecurityComponent)
      },
      {
        path: 'how-it-works',
        loadComponent: () => import('./pages/how-it-works/how-it-works.component').then(m => m.HowItWorksComponent)
      },
      {
        path: 'contact',
        loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent)
      },
      {
        path: 'download',
        loadComponent: () => import('./pages/download/download.component').then(m => m.DownloadComponent)
      },

      // ---- RESOURCES ----
      { path: 'blog',     component: BlogComponent },
      { path: 'blog/:id', component: BlogDetailComponent },
      { path: 'reports',  component: ReportsComponent },
      { path: 'ebook',    component: EbookComponent },
      { path: 'faq',      component: FAQComponent },
    ],
  },
  
  // ---- AUTHENTICATION (Standalone Full Page Layouts) ----
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent)
  },

  // ---- CLIENT DASHBOARD (Secured Layout) ----
  {
    path: 'client',
    loadComponent: () => import('./layouts/client-layout/client-layout').then(m => m.ClientLayout),
    children: [
       { path: 'dashboard', loadComponent: () => import('./pages/client/dashboard/dashboard.component').then(m => m.ClientDashboardComponent) },
       { path: 'settings',  loadComponent: () => import('./pages/client/settings/settings.component').then(m => m.SettingsComponent) },
       { path: 'transactions', loadComponent: () => import('./pages/client/transactions/transactions.component').then(m => m.TransactionsComponent) }
    ]
  },

  // ---- ADMIN PANEL (Secured Layout) ----
  {
    path: 'admin',
    loadComponent: () => import('./layouts/admin-layout/admin-layout').then(m => m.AdminLayout),
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/admin/dashboard/dashboard.component').then(m => m.AdminDashboardComponent) }
    ]
  }
];
