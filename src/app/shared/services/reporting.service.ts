import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ReportingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/Report`;

  getTrialBalance(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/trial-balance`);
  }

  getChartOfAccounts(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/chart-of-accounts`);
  }

  seedAccounts(): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/seed-accounts`, {});
  }
}
