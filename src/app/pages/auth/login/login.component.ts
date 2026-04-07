import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../shared/services/auth.service';
import { UserRole } from '../../../shared/models/user-role.enum';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
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
          if (response.success || response.boolean) {
            const user = response.data;
            // Save the user data to AuthService session
            this.authService.setCurrentUser(response.data);
            
            // Redirect based on role
            //const user = response.data;
            const role = user.role || user.Role || user.userRole || user.UserRole;
            
            if (role === UserRole.Admin || role === UserRole.SuperAdmin) {
              this.router.navigate(['/admin/dashboard']);
            } else {
              this.router.navigate(['/client/dashboard']);
            }
          } else {
            this.errorMessage.set(response.message || 'Login failed');
          }
        },
        error: (err) => {
          this.isProcessing.set(false);
          this.errorMessage.set(err.error?.message || 'Access denied: Invalid email or password');
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
