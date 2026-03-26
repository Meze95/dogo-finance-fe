import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-download',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './download.component.html',
  styleUrl: './download.component.css'
})
export class DownloadComponent {}
