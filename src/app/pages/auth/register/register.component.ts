import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../shared/services/auth.service';
import { AuthLayoutComponent } from '../../../layouts/auth-layout/auth-layout.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, AuthLayoutComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  registerForm: FormGroup;
  showPassword = signal(false);
  isProcessing = signal(false);
  isSuccess = signal(false);
  errorMessage = signal<string | null>(null);
  genders = signal<any[]>([]);
  isGenderDropdownOpen = signal(false);

  constructor() {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dob: ['', Validators.required],
      genderId: ['', Validators.required],
      isPep: [false],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.loadGenders();
  }

  loadGenders() {
    this.authService.getGenders().subscribe({
      next: (res) => {
        if (res.success || res.boolean) {
          this.genders.set(res.data);
        }
      }
    });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  togglePassword() {
    this.showPassword.set(!this.showPassword());
  }

  getSelectedGenderName(): string {
    const id = this.registerForm.get('genderId')?.value;
    const gender = this.genders().find(g => g.id == id);
    return gender ? gender.name : 'Select Gender';
  }

  selectGender(id: any) {
    this.registerForm.get('genderId')?.setValue(id);
    this.isGenderDropdownOpen.set(false);
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isProcessing.set(true);
      this.errorMessage.set(null);

      const formData = this.registerForm.value;
      const payload = {
        customerTypeId: 1, // 1 = Individual
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        dateOfBirth: formData.dob,
        genderId: parseInt(formData.genderId),
        isPoliticallyExposed: formData.isPep,
        referralCode: '' // Optional
      };

      this.authService.signUp(payload).subscribe({
        next: (response) => {
          this.isProcessing.set(false);
          if (response.success || response.boolean) {
            this.isSuccess.set(true);
            // Scroll to top to see success message
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            this.errorMessage.set(response.message || 'Registration failed');
          }
        },
        error: (err) => {
          this.isProcessing.set(false);
          this.errorMessage.set(err.error?.message || 'An error occurred during registration. Please check your connection.');
          console.error('Registration error:', err);
        }
      });
    } else {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
    }
  }
}
