import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-regulatory',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './regulatory.component.html',
  styleUrl: './regulatory.component.css'
})
export class RegulatoryComponent {}
