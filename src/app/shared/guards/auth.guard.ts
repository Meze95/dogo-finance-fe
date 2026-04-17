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

  // SOURCE OF TRUTH: On refresh, we must check localStorage directly because
  // signals might still be initializing/hydrating.
  const storedUser = localStorage.getItem('dogo_user');
  let user: any = null;

  if (storedUser) {
    try {
      user = JSON.parse(storedUser);
      // Sync signal if it's currently null
      if (!authService.currentUser()) {
        authService.setCurrentUser(user);
      }
    } catch (e) {
      user = null;
    }
  }

  // 1. Check if user is logged in
  if (!user) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
  
  return true;
};
