import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isLoggedIn = authService.isLoggedIn();
  console.log('🔐 Auth Guard Check:', { isLoggedIn, url: state.url });

  if (isLoggedIn) {
    console.log('✅ Access granted');
    return true;
  }

  console.log('⛔ Redirecting to login');
  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
};

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isLoggedIn = authService.isLoggedIn();
  const isAdmin = authService.isAdmin();
  
  console.log('👑 Admin Guard Check:', { isLoggedIn, isAdmin, url: state.url });

  if (isLoggedIn && isAdmin) {
    console.log('✅ Admin access granted');
    return true;
  }

  console.log('⛔ Admin access denied');
  router.navigate(['/']);
  return false;
};