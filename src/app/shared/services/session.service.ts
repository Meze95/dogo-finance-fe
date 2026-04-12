import { Injectable, inject, signal, PLATFORM_ID, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { fromEvent, merge, Subscription, timer } from 'rxjs';

declare var Swal: any;

@Injectable({
  providedIn: 'root'
})
export class SessionService implements OnDestroy {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = environment.apiUrl;

  private timeoutMinutes = signal<number>(10); // Default set to 10 mins as per requirement
  private activitySubscription?: Subscription;
  private timerSubscription?: Subscription;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initSessionManagement();
    }
  }

  private initSessionManagement() {
    // 1. Fetch timeout from DB
    this.http.get<any>(`${this.apiUrl}/SystemSetting/timeout`).subscribe({
      next: (res) => {
        if (res.success && res.data?.timeoutInMinutes) {
          this.timeoutMinutes.set(res.data.timeoutInMinutes);
          console.log(`Session timeout set to ${res.data.timeoutInMinutes} minutes from DB`);
        }
        this.startMonitoring();
      },
      error: () => {
        console.warn('Could not fetch timeout from DB, using default');
        this.startMonitoring();
      }
    });
  }

  private startMonitoring() {
    if (this.activitySubscription) this.activitySubscription.unsubscribe();

    // Reset timer on any of these events
    const activityEvents$ = merge(
      fromEvent(window, 'mousemove'),
      fromEvent(window, 'mousedown'),
      fromEvent(window, 'keypress'),
      fromEvent(window, 'scroll'),
      fromEvent(window, 'touchstart')
    );

    this.activitySubscription = activityEvents$.subscribe(() => {
      this.resetTimer();
    });

    this.resetTimer();
  }

  private resetTimer() {
    if (this.timerSubscription) this.timerSubscription.unsubscribe();

    const timeoutMs = this.timeoutMinutes() * 60 * 1000;

    // We start a timer that will fire after the timeout
    this.timerSubscription = timer(timeoutMs).subscribe(() => {
      this.handleTimeout();
    });
  }

  private handleTimeout() {
    const user = this.authService.currentUser();
    if (!user) return; // Already logged out or never logged in

    this.stopMonitoring();

    this.authService.logout();
    this.router.navigate(['/lockout']);
  }

  stopMonitoring() {
    if (this.activitySubscription) this.activitySubscription.unsubscribe();
    if (this.timerSubscription) this.timerSubscription.unsubscribe();
  }

  ngOnDestroy() {
    this.stopMonitoring();
  }
}
