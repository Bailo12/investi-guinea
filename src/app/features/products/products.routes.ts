import { Routes } from '@angular/router';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./products-list/products-list.component').then(
        (m) => m.ProductsListComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./product-detail/product-detail.component').then(
        (m) => m.ProductDetailComponent
      ),
  },
  {
    path: ':id/invest',
    loadComponent: () =>
      import('./product-invest/product-invest.component').then(
        (m) => m.ProductInvestComponent
      ),
  },
];
