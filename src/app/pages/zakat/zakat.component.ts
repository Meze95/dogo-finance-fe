import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-zakat',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './zakat.component.html',
  styleUrl: './zakat.component.css'
})
export class ZakatComponent {}
