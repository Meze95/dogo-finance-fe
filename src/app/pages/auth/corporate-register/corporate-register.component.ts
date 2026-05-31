import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { AuthLayoutComponent } from '../../../layouts/auth-layout/auth-layout.component';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-corporate-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, AuthLayoutComponent],
  templateUrl: './corporate-register.component.html',
  styleUrl: './corporate-register.component.css'
})
export class CorporateRegisterComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  corporateForm: FormGroup;
  showPassword = signal(false);
  isProcessing = signal(false);
  isSuccess = signal(false);
  errorMessage = signal<string | null>(null);

  // Live password requirement check signals
  hasMinLength = signal(false);
  hasUppercase = signal(false);
  hasSpecialChar = signal(false);
  hasAlphanumeric = signal(false);

  constructor() {
    this.corporateForm = this.fb.group({
      businessName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, this.passwordStrengthValidator.bind(this)]],
      agreeToTerms: [false, [Validators.requiredTrue]]
    });

    // Listen to password changes to update requirement signals in real time
    this.corporateForm.get('password')?.valueChanges.subscribe(val => {
      const password = val || '';
      this.hasMinLength.set(password.length >= 8);
      this.hasUppercase.set(/[A-Z]/.test(password));
      this.hasSpecialChar.set(/[!@#$%^&*(),.?":{}|<>_]/.test(password));
      this.hasAlphanumeric.set(/[a-zA-Z]/.test(password) && /[0-9]/.test(password));
    });
  }

  // Custom password strength validator
  passwordStrengthValidator(control: AbstractControl) {
    const value = control.value || '';
    const hasMin = value.length >= 8;
    const hasUpper = /[A-Z]/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>_]/.test(value);
    const hasAlphaNum = /[a-zA-Z]/.test(value) && /[0-9]/.test(value);

    if (hasMin && hasUpper && hasSpecial && hasAlphaNum) {
      return null;
    }
    return { strength: true };
  }

  togglePassword() {
    this.showPassword.set(!this.showPassword());
  }

  onSubmit() {
    if (this.corporateForm.valid) {
      this.isProcessing.set(true);
      this.errorMessage.set(null);

      const formData = this.corporateForm.value;
      
      // Log the collected form data to the console as requested
      console.log('--- Corporate Registration Submitted ---');
      console.log('Payload:', {
        businessName: formData.businessName,
        email: formData.email,
        password: '••••••••', // Mask for security in logs but log that it is captured
        agreedToTerms: formData.agreeToTerms
      });
      console.log('Raw Form Values:', formData);
      console.log('-----------------------------------------');

      // Use the unified SignUp API
      const payload = {
        customerTypeId: 2, // 2 = Corporate
        businessName: formData.businessName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.password, // Frontend only captures 1 password, backend expects confirmPassword too
        phoneNumber: '00000000000' // Placeholder if not captured in the frontend yet
      };

      this.authService.signUp(payload).subscribe({
        next: (response) => {
          this.isProcessing.set(false);
          if (response.success || response.boolean) {
            this.isSuccess.set(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            this.errorMessage.set(response.message || 'Registration failed');
          }
        },
        error: (err) => {
          this.isProcessing.set(false);
          this.errorMessage.set(err.error?.message || 'An error occurred during registration.');
          console.error('Registration error:', err);
        }
      });
    } else {
      // Mark all controls as touched to trigger validation displays
      Object.keys(this.corporateForm.controls).forEach(key => {
        this.corporateForm.get(key)?.markAsTouched();
      });
      this.errorMessage.set('Please fill in all required fields and satisfy all password conditions.');
    }
  }
}

