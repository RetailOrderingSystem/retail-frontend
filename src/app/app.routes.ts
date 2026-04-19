import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  // Auth Layout Routes
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then(m => m.RegisterComponent)
      },
      {
        path: 'otp',
        loadComponent: () =>
          import('./features/auth/otp/otp.component').then(m => m.OtpComponent)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },

  // Main Layout Routes (Public + Protected)
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      // Public
      {
        path: 'products',
        loadComponent: () =>
          import('./features/products/product-list/product-list.component')
          .then(m => m.ProductListComponent)
      },
      {
        path: 'products/:id',
        loadComponent: () =>
          import('./features/products/product-details/product-details.component')
          .then(m => m.ProductDetailsComponent)
      },

      // Protected Routes
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/auth/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'cart',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/orders/cart/cart.component').then(m => m.CartComponent)
      },
      {
        path: 'checkout',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/orders/checkout/checkout.component').then(m => m.CheckoutComponent)
      },
      {
        path: 'orders',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/orders/order-history/order-history.component')
          .then(m => m.OrderHistoryComponent)
      },
      {
        path: 'orders/tracking/:id',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/orders/tracking/tracking.component').then(m => m.TrackingComponent)
      },

      // Admin Routes
      {
        path: 'admin',
        canActivate: [adminGuard],
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/admin/dashboard/dashboard.component')
              .then(m => m.DashboardComponent)
          },
          {
            path: 'products',
            loadComponent: () =>
              import('./features/admin/manage-products/manage-products.component')
              .then(m => m.ManageProductsComponent)
          },
          {
            path: 'orders',
            loadComponent: () =>
              import('./features/admin/manage-orders/manage-orders.component')
              .then(m => m.ManageOrdersComponent)
          },
          {
            path: 'users',
            loadComponent: () =>
              import('./features/admin/manage-users/manage-users.component')
              .then(m => m.ManageUsersComponent)
          },
          {
            path: 'coupons',
            loadComponent: () =>
              import('./features/admin/coupons/coupons.component').then(m => m.CouponsComponent)
          },
        ]
      },
    ]
  },

  // Wildcard
  { path: '**', redirectTo: 'auth/login' }
];

