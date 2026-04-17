import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  if (req.headers.has('skip-interceptor')) {
    const headers = req.headers.delete('skip-interceptor');
    return next(req.clone({ headers }));
  }

  const user = authService.currentUser();
  const token = user?.Token || user?.token;

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Check if we've already attempted to refresh for this specific request to prevent loops
      const isRetry = req.headers.has('X-Retry-Done');

      if (error.status === 401 && !isRetry && !req.url.includes('Auth/login') && !req.url.includes('Auth/refresh')) {
        return authService.refreshToken().pipe(
          switchMap(() => {
            const latestUser = authService.currentUser();
            const newToken = latestUser?.Token || latestUser?.token || latestUser?.accessToken || latestUser?.AccessToken;
            
            const updatedReq = req.clone({
              setHeaders: { 
                Authorization: `Bearer ${newToken}`,
                'X-Retry-Done': 'true' 
              }
            });
            return next(updatedReq);
          }),
          catchError((refreshError) => {
            // authService.logout();
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
