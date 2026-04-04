import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  user = this.authService.currentUser;
  
  // Safe getters for user properties to handle both PascalCase and camelCase
  get firstName() { return this.user()?.FirstName || this.user()?.firstName || 'Dogo'; }
  get lastName() { return this.user()?.LastName || this.user()?.lastName || 'User'; }
  get email() { return this.user()?.Email || this.user()?.email || 'user@example.com'; }
  get phone() { return this.user()?.Phone || this.user()?.phone || '07064212589'; }

  // Fake User ID for display as seen in the image
  displayId = '77775b68cb1121';

  ngOnInit() {
    // In a real app, we might fetch full profile details here
  }

  cancel() {
    this.router.navigate(['/client/dashboard']);
  }

  goBack() {
    window.history.back();
  }
}
