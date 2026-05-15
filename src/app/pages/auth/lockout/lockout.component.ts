import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthLayoutComponent } from '../../../layouts/auth-layout/auth-layout.component';

@Component({
  selector: 'app-lockout',
  standalone: true,
  imports: [CommonModule, RouterModule, AuthLayoutComponent],
  templateUrl: './lockout.component.html',
  styleUrl: './lockout.component.css'
})
export class LockoutComponent { }
