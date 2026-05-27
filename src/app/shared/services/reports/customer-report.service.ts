import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface CompanyProfile {
  companyName: string;
  address: string;
}

export interface ClientOnboardingReport {
  totalRecords: number;
  currentPage: number;
  totalPages: number;
  companyProfile?: CompanyProfile;
  totalNewUsers: number;
  kycVerified: number;
  kycUnverified: number;
  kycPending: number;
  recentSignups: Array<{
    name: string;
    email: string;
    dateJoined: string;
    kycStatus: string;
  }>;
}

export interface ClientActivityReport {
  totalRecords: number;
  currentPage: number;
  totalPages: number;
  companyProfile?: CompanyProfile;
  totalActiveUsers: number;
  totalInactiveUsers: number;
  activityLogs: Array<{
    name: string;
    email: string;
    lastLoginDate: string;
    status: string;
  }>;
}

export interface ClientPortfolioReport {
  totalRecords: number;
  currentPage: number;
  totalPages: number;
  companyProfile?: CompanyProfile;
  totalInvestment: number;
  totalPortfolioValue: number;
  productSpread: Array<{
    productName: string;
    amountInvested: number;
  }>;
  clientPortfolios: Array<{
    clientName: string;
    email: string;
    totalInvested: number;
    portfolioValue: number;
  }>;
}

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
  Status?: number;
  status?: number;
  Message?: string;
  Data?: T;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerReportService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Report`;

  getClientOnboardingReport(startDate?: string, endDate?: string, pageNumber: number = 1, pageSize: number = 10): Observable<ApiResponse<ClientOnboardingReport>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<ApiResponse<ClientOnboardingReport>>(`${this.apiUrl}/client-onboarding`, { params });
  }

  getClientActivityReport(startDate?: string, endDate?: string, pageNumber: number = 1, pageSize: number = 10): Observable<ApiResponse<ClientActivityReport>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<ApiResponse<ClientActivityReport>>(`${this.apiUrl}/client-activity`, { params });
  }

  getClientPortfolioReport(pageNumber: number = 1, pageSize: number = 10): Observable<ApiResponse<ClientPortfolioReport>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<ApiResponse<ClientPortfolioReport>>(`${this.apiUrl}/client-portfolio`, { params });
  }
}
