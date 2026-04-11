import { Injectable, signal } from '@angular/core';

export interface Alert {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'loading';
  title: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private _alerts = signal<Alert[]>([]);
  alerts = this._alerts.asReadonly();

  show(type: Alert['type'], title: string, message: string, duration: number = 4000): string {
    const id = Math.random().toString(36).substring(2, 9);
    this._alerts.update(current => [...current, { id, type, title, message }]);
    
    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
    
    return id;
  }

  success(title: string, message: string) { return this.show('success', title, message); }
  error(title: string, message: string) { return this.show('error', title, message, 6000); }
  info(title: string, message: string) { return this.show('info', title, message); }
  warning(title: string, message: string) { return this.show('warning', title, message, 5000); }
  
  // Loading toast doesn't auto-dismiss
  loading(title: string, message: string) { return this.show('loading', title, message, 0); }

  remove(id: string) {
    this._alerts.update(current => current.filter(alert => alert.id !== id));
  }
}
