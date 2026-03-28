import { Component, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword implements OnDestroy {
  forgotForm: FormGroup;
  isProcessing = signal(false);
  isSuccess = signal(false);
  countdown = signal(60);
  private countdownTimer: any;

  constructor(private fb: FormBuilder, private router: Router) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotForm.valid) {
      this.isProcessing.set(true);
      // Simulate API call
      setTimeout(() => {
        this.isProcessing.set(false);
        this.isSuccess.set(true);
        this.startCountdown();
      }, 1500);
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
