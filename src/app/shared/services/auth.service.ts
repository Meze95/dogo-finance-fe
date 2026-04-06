import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { UserRole } from '../models/user-role.enum';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = environment.apiUrl;
  
  currentUser = signal<any>(this.getUserFromStorage());

  hasRole(roles: UserRole[]): boolean {
    const user = this.currentUser();
    if (!user) return false;
    const userRole = user.role || user.Role || user.userRole || user.UserRole;
    return roles.includes(userRole as UserRole);
  }

  signUp(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Customer/signup`, data);
  }

  verifyEmail(email: string, code: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/Customer/verify-email`, { email, code });
  }

  resendCode(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/Customer/resend-code?email=${email}`, {});
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

  setupPin(data: { pin: string, confirmPin: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/Auth/pin/setup`, data);
  }

  refreshToken(): Observable<any> {
    const user = this.currentUser();
    const token = user?.Token || user?.token;
    const refreshToken = user?.RefreshToken || user?.refreshToken;

    // We pass the refreshToken in a header so the backend can identify the specific session
    const headers = new HttpHeaders().set('X-Refresh-Token', refreshToken || '');

    return this.http.post<any>(`${this.apiUrl}/Auth/refresh`, { token, refreshToken }, { headers }).pipe(
      tap((response: any) => {
        if (response.success && response.data) {
          const updatedUser = { ...user, ...response.data };
          this.setCurrentUser(updatedUser);
        }
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
      return;
    }

    // Notifying backend. The interceptor will add the Access Token.
    // We add the Refresh Token manually so the backend knows which session to kill.
    const refreshToken = user?.RefreshToken || user?.refreshToken;
    const headers = new HttpHeaders().set('X-Refresh-Token', refreshToken || '');

    this.http.post(`${this.apiUrl}/Auth/logout`, {}, { headers }).subscribe({
      next: () => {
        console.log('Backend logout success');
        this.setCurrentUser(null);
      },
      error: (err) => {
        console.error('Backend logout failed', err);
        this.setCurrentUser(null);
      }
    });
  }
}
