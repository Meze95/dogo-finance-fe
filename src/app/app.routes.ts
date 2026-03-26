import { Routes } from '@angular/router';
import { HomeLayout } from './layouts/home-layout/home-layout';
import { LandingComponent } from './pages/landing/landing.component';
import { InvestmentComponent } from './pages/investment/investment.component';
import { StoriesComponent } from './pages/stories/stories.component';
import { FAQComponent } from './pages/faq/faq.component';
import { SavingsPlanComponent } from './pages/savings-plan/savings-plan.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeLayout,
    children: [
      {
        path: '',
        component: LandingComponent,
      },
      {
        path: 'invest',
        component: InvestmentComponent,
      },
      {
        path: 'stories',
        component: StoriesComponent,
      },
      {
        path: 'faq',
        component: FAQComponent,
      },
      {
        path: 'save/:plan',
        component: SavingsPlanComponent,
      },
    ],
  },
  // Add other layout-wrapped routes here as needed
];
