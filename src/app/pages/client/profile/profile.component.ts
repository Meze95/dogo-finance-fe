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

  profilePic = signal<string | null>(null);
  isUploading = signal(false);

  ngOnInit() {
    // Initialize profile pic if available in user object
    const pic = this.user()?.ProfilePic || this.user()?.profilePic;
    if (pic) this.profilePic.set(pic);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.isUploading.set(true);
      const reader = new FileReader();
      reader.onload = () => {
        // Simulation delay
        setTimeout(() => {
          this.profilePic.set(reader.result as string);
          this.isUploading.set(false);
          // In a real app, you would upload this to the server here:
          // this.customerService.updateProfilePic(file).subscribe(...)
        }, 1500);
      };
      reader.readAsDataURL(file);
    }
  }

  cancel() {
    this.router.navigate(['/client/dashboard']);
  }

  goBack() {
    window.history.back();
  }
}
