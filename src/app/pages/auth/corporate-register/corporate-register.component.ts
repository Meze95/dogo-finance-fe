import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthLayoutComponent } from '../../../layouts/auth-layout/auth-layout.component';

@Component({
  selector: 'app-corporate-register',
  standalone: true,
  imports: [CommonModule, RouterModule, AuthLayoutComponent],
  templateUrl: './corporate-register.component.html',
  styleUrl: './corporate-register.component.css'
})
export class CorporateRegisterComponent {}
