import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user-role.enum';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  
  // SSR FIX: Skip guard check on the server (server cannot access localStorage)
  // Let the browser handle the guard logic after hydration.
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const user = authService.currentUser();

  // 1. Check if user is logged in
  if (!user) {
    console.log('RoleGuard: No user found, redirecting to login.');
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // 2. Get required roles from route data
  const requiredRoles = route.data['roles'] as Array<UserRole>;

  // 3. If no specific roles are required, allow access
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  // 4. Check if user's role matches any of the required roles
  const userRole = user.role || user.Role || user.userRole || user.UserRole;

  console.log('RoleGuard check:', { 
    userRole, 
    requiredRoles, 
    isAuthorized: requiredRoles.some(r => String(r).toLowerCase() === String(userRole).toLowerCase())
  });

  // Shortcut: SuperAdmins ALWAYS have access to Admin routes
  if (String(userRole).toLowerCase() === UserRole.SuperAdmin.toLowerCase()) {
    console.log('RoleGuard: SuperAdmin detected. Granting universal access.');
    return true;
  }

  if (requiredRoles.some(r => String(r).toLowerCase() === String(userRole).toLowerCase())) {
    
    // 5. Additional check for specific permission (Access Rights) if specified
    const requiredPermission = route.data['permission'] as string;
    if (requiredPermission) {
      const permissions = user.permissions || user.Permissions || [];
      const hasPermission = permissions.some((p: string) => p.toLowerCase() === requiredPermission.toLowerCase());
      
      console.log('RoleGuard permission check:', { requiredPermission, hasPermission });

      if (!hasPermission) {
        console.log(`RoleGuard: User has role but lacks required permission: ${requiredPermission}`);
        router.navigate(['/login']); // or a forbidden page
        return false;
      }
    }

    return true;
  }

  // 5. If not authorized, redirect to login (as requested by USER)
  console.log(`RoleGuard: User role ${userRole} not authorized for this route. Access denied.`);
  router.navigate(['/login']);
  return false;
};
