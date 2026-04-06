import { inject, PLATFORM_ID } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // If we are on the server, we might not have localStorage access.
  // We return true and let the client-side guard handle the actual verification after hydration.
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const user = authService.currentUser();
  
  if (user) {
    if (user.role === 'Customer') {
       return true;
    }
    
    // Logged in but NOT a Customer
    console.warn('Access denied: role must be Customer', user.role);
    router.navigate(['/login']);
    return false;
  }

  // Not logged in so redirect to login page with the return url
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
