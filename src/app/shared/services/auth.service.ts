import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, tap, BehaviorSubject, filter, take, switchMap, of, throwError, catchError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { UserRole } from '../models/user-role.enum';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = environment.apiUrl;
  private router = inject(Router);
  private isRefreshingToken = false;
  private refreshTokenSubject = new BehaviorSubject<any>(null);

  currentUser = signal<any>(this.getUserFromStorage());
  
  constructor() {}

  hasRole(roles: UserRole[]): boolean {
    const user = this.currentUser();
    if (!user) return false;
    // Standardizing on 'role' property
    const userRole = user.role || user.Role || user.userRole || user.UserRole;
    if (!userRole) return false;
    
    return roles.some(r => String(r).toLowerCase() === String(userRole).toLowerCase());
  }

  signUp(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Customer/signup`, data);
  }

  getGenders(): Observable<any> {
    return this.http.get(`${this.apiUrl}/Customer/genders`);
  }

  verifyEmail(email: string, code: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/Customer/verify-email`, { email, code });
  }

  resendCode(email: string): Observable<any> {
    // Security Fix: Move sensitive data from query params to the POST body
    return this.http.post(`${this.apiUrl}/Customer/resend-code`, { email });
  }

  login(credentials: any): Observable<any> {
    // Basic device detection
    const deviceName = this.getDeviceName();
    return this.http.post(`${this.apiUrl}/Auth/login`, { ...credentials, deviceName });
  }

  private getDeviceName(): string {
    if (!isPlatformBrowser(this.platformId)) return 'Server Side';
    const ua = navigator.userAgent;
    if (ua.includes('iPhone')) return 'iPhone';
    if (ua.includes('Android')) return 'Android Device';
    if (ua.includes('Windows')) return 'Windows PC';
    if (ua.includes('Macintosh')) return 'Macbook/Mac';
    return 'Web Browser';
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/Auth/forgot-password`, { email });
  }

  resetPassword(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Auth/reset-password`, data);
  }

  changePassword(data: { OldPassword: string, NewPassword: string, ConfirmPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/Auth/change-password`, data);
  }

  toggle2fa(status: boolean): Observable<any> {
    return this.http.post(`${this.apiUrl}/Auth/2fa/toggle?status=${status}`, {});
  }

  setupPin(data: { pin: string, confirmPin: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/Auth/pin/setup`, data);
  }

  refreshToken(): Observable<any> {
    if (this.isRefreshingToken) {
      return this.refreshTokenSubject.pipe(
        filter(res => res !== null),
        take(1)
      );
    }

    this.isRefreshingToken = true;
    this.refreshTokenSubject.next(null);

    const user = this.currentUser();
    const token = user?.Token || user?.token;
    const refreshToken = user?.RefreshToken || user?.refreshToken;

    if (!refreshToken) {
      this.isRefreshingToken = false;
      return throwError(() => new Error('No refresh token available'));
    }

    // Explicitly bypass interceptor headers for this request to avoid potential recursion or bad state
    const headers = new HttpHeaders()
      .set('X-Refresh-Token', refreshToken)
      .set('skip-interceptor', 'true'); 

    return this.http.post<any>(`${this.apiUrl}/Auth/refresh`, { 
      Token: token, 
      RefreshToken: refreshToken 
    }, { headers }).pipe(
      tap((response: any) => {
        this.isRefreshingToken = false;
        if (response.success && response.data) {
          const updatedUser = { ...user, ...response.data };
          this.setCurrentUser(updatedUser);
          this.refreshTokenSubject.next(response);
        } else {
          this.refreshTokenSubject.next(null);
        }
      }),
      catchError(err => {
        this.isRefreshingToken = false;
        this.refreshTokenSubject.next(null);
        return throwError(() => err);
      })
    );
  }

  getSessions(): Observable<any> {
    return this.http.get(`${this.apiUrl}/Auth/sessions`);
  }

  revokeSession(sessionId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Auth/sessions/${sessionId}`);
  }

  private getUserFromStorage() {
    if (isPlatformBrowser(this.platformId)) {
      const user = localStorage.getItem('dogo_user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  setCurrentUser(user: any) {
    if (isPlatformBrowser(this.platformId)) {
      if (user) {
        localStorage.setItem('dogo_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('dogo_user');
      }
    }
    this.currentUser.set(user);
  }

  logout() {
    const user = this.currentUser();
    if (!user) {
      this.setCurrentUser(null);
      this.router.navigate(['/login']);
      return;
    }

    // Notifying backend. The interceptor will add the Access Token.
    // We add the Refresh Token manually so the backend knows which session to kill.
    const refreshToken = user?.RefreshToken || user?.refreshToken;
    const headers = new HttpHeaders().set('X-Refresh-Token', refreshToken || '');

    this.http.post(`${this.apiUrl}/Auth/logout`, {}, { headers }).subscribe({
      next: () => {
        this.setCurrentUser(null);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.setCurrentUser(null);
        this.router.navigate(['/login']);
      }
    });
  }
}
