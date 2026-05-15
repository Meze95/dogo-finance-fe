import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './auth-layout.component.html',
  styles: [`
    :host { display: block; }
  `]
})
export class AuthLayoutComponent {
  @Input() sidebarTitle: string = '';
  @Input() sidebarHighlight: string = '';
  @Input() sidebarSubtext: string = '';
  @Input() sidebarNoticeTitle: string = '';
  @Input() sidebarNoticeBody: string = '';
  @Input() sidebarNoticeIcon: string = 'ri-lock-2-fill';
  
  @Input() pageTitle: string = '';
  @Input() pageSubtext: string = '';
  
  @Input() backLink: string = '/';
  @Input() backText: string = 'Back Home';
}
