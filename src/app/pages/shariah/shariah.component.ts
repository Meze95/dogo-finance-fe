import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-shariah',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './shariah.component.html',
  styleUrl: './shariah.component.css'
})
export class ShariahComponent {}
