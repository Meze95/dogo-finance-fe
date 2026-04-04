import { Component, signal, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword implements OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  forgotForm: FormGroup;
  isProcessing = signal(false);
  isSuccess = signal(false);
  errorMessage = signal('');
  countdown = signal(60);
  private countdownTimer: any;

  constructor() {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotForm.valid) {
      this.isProcessing.set(true);
      this.errorMessage.set('');
      
      this.authService.forgotPassword(this.forgotForm.value.email).subscribe({
        next: (res) => {
          this.isProcessing.set(false);
          this.isSuccess.set(true);
          this.startCountdown();
          // After 2 seconds, redirect to reset-password with email as query param
          setTimeout(() => {
            this.router.navigate(['/reset-password'], { queryParams: { email: this.forgotForm.value.email } });
          }, 3000);
        },
        error: (err) => {
          this.isProcessing.set(false);
          this.errorMessage.set(err.error?.message || 'Failed to send reset code. Please try again.');
        }
      });
    } else {
      this.forgotForm.markAllAsTouched();
    }
  }

  startCountdown() {
    this.countdown.set(60);
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    
    this.countdownTimer = setInterval(() => {
      const current = this.countdown();
      if (current > 0) {
        this.countdown.set(current - 1);
      } else {
        clearInterval(this.countdownTimer);
      }
    }, 1000);
  }

  ngOnDestroy() {
     if (this.countdownTimer) clearInterval(this.countdownTimer);
  }
}
