import { Routes } from '@angular/router';

export const PREMIUM_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./premium-dashboard/premium-dashboard.component').then(m => m.PremiumDashboardComponent)
  },
  {
    path: 'plans',
    loadComponent: () => import('./premium-plans/premium-plans.component').then(m => m.PremiumPlansComponent)
  },
  {
    path: 'projects',
    loadComponent: () => import('./premium-projects/premium-projects.component').then(m => m.PremiumProjectsComponent)
  },
  {
    path: 'projects/:id',
    loadComponent: () => import('./premium-project-detail/premium-project-detail.component').then(m => m.PremiumProjectDetailComponent)
  }
];


