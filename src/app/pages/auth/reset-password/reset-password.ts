import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  resetForm: FormGroup;
  isProcessing = signal(false);
  isSuccess = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);
  email: string | null = null;

  constructor() {
    this.resetForm = this.fb.group({
      token: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.email = this.route.snapshot.queryParamMap.get('email');
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.resetForm.patchValue({ token });
    }
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  togglePassword() {
    this.showPassword.set(!this.showPassword());
  }

  onSubmit() {
    if (this.resetForm.valid) {
      this.isProcessing.set(true);
      this.errorMessage.set('');

      const payload = {
        ...this.resetForm.value,
        // If the backend also needs email, we can add it here.
        // Based on ResetPasswordRequest in C#, it only needs Token, NewPassword, ConfirmPassword.
      };

      this.authService.resetPassword(payload).subscribe({
        next: (res) => {
          this.isProcessing.set(false);
          this.isSuccess.set(true);
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: (err) => {
          this.isProcessing.set(false);
          this.errorMessage.set(err.error?.message || 'Failed to reset password. The code may be invalid or expired.');
        }
      });
    } else {
      this.resetForm.markAllAsTouched();
    }
  }
}
