import { Routes } from '@angular/router';
import { roleGuard } from './shared/guards/role.guard';
import { UserRole } from './shared/models/user-role.enum';
import { HomeLayout } from './layouts/home-layout/home-layout';
import { LandingComponent } from './pages/landing/landing.component';
import { FAQComponent } from './pages/faq/faq.component';
import { BlogComponent } from './pages/resources/blog/blog.component';
import { BlogDetailComponent } from './pages/resources/blog-detail/blog-detail.component';
import { CalculatorComponent } from './pages/resources/calculator/calculator.component';
import { ReportsComponent } from './pages/resources/reports/reports.component';
import { EbookComponent } from './pages/resources/ebook/ebook.component';

export const routes: Routes = [
  // ---- AUTHENTICATION (Standalone Full Page Layouts) ----
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./pages/auth/admin-login/admin-login.component').then(m => m.AdminLoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'register/corporate',
    loadComponent: () => import('./pages/auth/corporate-register/corporate-register.component').then(m => m.CorporateRegisterComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/auth/forgot-password/forgot-password').then(m => m.ForgotPassword)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./pages/auth/reset-password/reset-password').then(m => m.ResetPassword)
  },
  {
    path: 'verify-email',
    loadComponent: () => import('./pages/auth/verify-email/verify-email.component').then(m => m.VerifyEmailComponent)
  },
  {
    path: 'lockout',
    loadComponent: () => import('./pages/auth/lockout/lockout.component').then(m => m.LockoutComponent)
  },

  // ---- CLIENT DASHBOARD (Secured Layout) ----
  {
    path: 'client',
    canActivate: [roleGuard],
    loadComponent: () => import('./layouts/client-layout/client-layout').then(m => m.ClientLayout),
    data: { roles: [UserRole.Customer] },
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/client/dashboard/dashboard.component').then(m => m.ClientDashboardComponent) },
      { path: 'products', loadComponent: () => import('./pages/client/portfolios/portfolios.component').then(m => m.ClientPortfoliosComponent) },
      { path: 'investments', loadComponent: () => import('./pages/client/investments/investments.component').then(m => m.ClientInvestmentsComponent) },
      { path: 'settings', loadComponent: () => import('./pages/client/settings/settings.component').then(m => m.SettingsComponent) },
      { path: 'profile', loadComponent: () => import('./pages/client/profile/profile.component').then(m => m.ProfileComponent) },
      { path: 'transactions', loadComponent: () => import('./pages/client/transactions/transactions.component').then(m => m.TransactionsComponent) }
    ]
  },

  // ---- CORPORATE DASHBOARD (Unsecured Layout for Design Review) ----
  {
    path: 'corporate',
    loadComponent: () => import('./layouts/corporate-layout/corporate-layout').then(m => m.CorporateLayout),
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/corporate/dashboard/corporate-dashboard.component').then(m => m.CorporateDashboardComponent) },
      { path: 'products', loadComponent: () => import('./pages/client/portfolios/portfolios.component').then(m => m.ClientPortfoliosComponent) },
      { path: 'investments', loadComponent: () => import('./pages/client/investments/investments.component').then(m => m.ClientInvestmentsComponent) },
      { path: 'settings', loadComponent: () => import('./pages/corporate/settings/corporate-settings.component').then(m => m.CorporateSettingsComponent) },
      { path: 'profile', loadComponent: () => import('./pages/client/profile/profile.component').then(m => m.ProfileComponent) },
      { path: 'transactions', loadComponent: () => import('./pages/client/transactions/transactions.component').then(m => m.TransactionsComponent) }
    ]
  },

  // ---- ADMIN PANEL (Secured Layout) ----
  {
    path: 'admin',
    loadComponent: () => import('./layouts/admin-layout/admin-layout').then(m => m.AdminLayout),
    canActivate: [roleGuard],
    data: { roles: [UserRole.Admin, UserRole.SuperAdmin] },
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/admin/dashboard/dashboard.component').then(m => m.AdminDashboardComponent) },
      {
        path: 'roles',
        loadComponent: () => import('./pages/admin/role-management/role-management.component').then(m => m.RoleManagementComponent),
        data: { roles: [UserRole.Admin, UserRole.SuperAdmin], permission: 'ViewRoles' }
      },
      {
        path: 'roles/access/:id',
        loadComponent: () => import('./pages/admin/access-right/access-right.component').then(m => m.AccessRightComponent),
        data: { roles: [UserRole.Admin, UserRole.SuperAdmin], permission: 'ManageAccessRights' }
      },
      { path: 'users', loadComponent: () => import('./pages/admin/user-hub/user-hub').then(m => m.UserHub) },
      { path: 'clients', loadComponent: () => import('./pages/admin/clients/clients').then(m => m.Clients) },
      { path: 'products', loadComponent: () => import('./pages/admin/products/admin-products').then(m => m.AdminProducts) },
      { path: 'investments', loadComponent: () => import('./pages/admin/investments/investments.component').then(m => m.AdminInvestmentsComponent) },
      { path: 'liquidation-requests', loadComponent: () => import('./pages/admin/liquidations/liquidations.component').then(m => m.AdminLiquidationsComponent) },
      { path: 'transactions', loadComponent: () => import('./pages/admin/transactions/transactions.component').then(m => m.AdminTransactionsComponent) },
      { path: 'verifications', loadComponent: () => import('./pages/admin/verifications/verifications.component').then(m => m.VerificationsComponent) },
      { path: 'withdrawals', loadComponent: () => import('./pages/admin/withdrawals/withdrawals').then(m => m.WithdrawalsComponent) },
      { path: 'manual-fund-approval', loadComponent: () => import('./pages/admin/manual-fund-approval/manual-fund-approval').then(m => m.ManualFundApprovalComponent) },
      { path: 'settings', loadComponent: () => import('./pages/admin/settings/settings').then(m => m.Settings) },
      { path: 'profile', loadComponent: () => import('./pages/admin/profile/profile').then(m => m.Profile) },
      { path: 'reports/client-onboarding', loadComponent: () => import('./pages/admin/reports/client-onboarding/client-onboarding.component').then(m => m.ClientOnboardingComponent) },
      { path: 'reports/client-activity', loadComponent: () => import('./pages/admin/reports/client-activity/client-activity.component').then(m => m.ClientActivityComponent) },
      { path: 'reports/client-portfolio', loadComponent: () => import('./pages/admin/reports/client-portfolio/client-portfolio.component').then(m => m.ClientPortfolioComponent) },
      { path: 'reports/trial-balance', loadComponent: () => import('./pages/admin/reports/trial-balance/trial-balance').then(m => m.TrialBalancePage) }
    ]
  },
  {
    path: 'access-denied',
    loadComponent: () => import('./pages/error/access-denied/access-denied.component').then(m => m.AccessDeniedComponent)
  },

  // ---- ROOT LAYOUT (Home / Marketing) ----
  {
    path: '',
    component: HomeLayout,
    children: [
      { path: '', component: LandingComponent },

      // ---- PRODUCTS ----
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
      { path: 'blog', component: BlogComponent },
      { path: 'blog/:id', component: BlogDetailComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'ebook', component: EbookComponent },
      { path: 'faq', component: FAQComponent },
    ],
  },

  // ---- 404 NOT FOUND (Wildcard) ----
  {
    path: '**',
    loadComponent: () => import('./pages/error/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
