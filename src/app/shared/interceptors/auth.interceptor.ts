import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
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
      if (error.status === 401 && !req.url.includes('Auth/login') && !req.url.includes('Auth/refresh')) {
        return authService.refreshToken().pipe(
          switchMap((response: any) => {
            const newToken = response.data?.Token || response.data?.token;
            const updatedReq = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` }
            });
            return next(updatedReq);
          }),
          catchError((refreshError) => {
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
