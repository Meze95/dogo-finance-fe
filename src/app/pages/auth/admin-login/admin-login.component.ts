import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../shared/services/auth.service';
import { UserRole } from '../../../shared/models/user-role.enum';
import { AuthLayoutComponent } from '../../../layouts/auth-layout/auth-layout.component';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, AuthLayoutComponent],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css'
})
export class AdminLoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  
  loginForm: FormGroup;
  showPassword = signal(false);
  isProcessing = signal(false);
  errorMessage = signal<string | null>(null);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Check if already logged in as staff
    const user = this.authService.currentUser();
    if (user) {
       const role = user.role || user.Role || user.userRole || user.UserRole;
       const isStaff = String(role).toLowerCase() !== 'customer' && String(role).toLowerCase() !== 'user';
       if (isStaff) {
          this.router.navigate(['/admin/dashboard']);
       }
    }
  }

  togglePassword() {
    this.showPassword.set(!this.showPassword());
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isProcessing.set(true);
      this.errorMessage.set(null);

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.isProcessing.set(false);
          const user = response.data;
          const role = user.role || user.Role || user.userRole || user.UserRole;
          const isStaff = String(role).toLowerCase() !== 'customer' && String(role).toLowerCase() !== 'user';

          // STRICT STAFF CHECK: Only Admin/SuperAdmin/Custom staff can login via this page
          if (isStaff) {
            this.authService.setCurrentUser(user);
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.errorMessage.set('Unauthorized! Please use the customer login terminal.');
            this.authService.logout();
          }
        },
        error: (err) => {
          this.isProcessing.set(false);
          this.errorMessage.set(err.error?.message || 'Access denied: Invalid staff credentials');
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
