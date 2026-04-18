import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

export interface MonnifyChargeRequest {
  reference: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  pin?: string;
}

export interface MonnifyAuthorizeRequest {
  reference: string;
  id: string;
  otp: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Transaction`;

  initiateDeposit(customerId: number, amount: number): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/deposit/initiate`, { customerId, amount });
  }

  chargeCard(data: MonnifyChargeRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/deposit/charge`, data);
  }

  authorizeDeposit(data: MonnifyAuthorizeRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/deposit/authorize`, data);
  }

  confirmDeposit(reference: string): Observable<ApiResponse> {
      // Correcting to matching case from backend: reference is a URL parameter
    return this.http.post<ApiResponse>(`${this.apiUrl}/deposit/confirm/${reference}`, {});
  }

  getVirtualAccount(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/deposit/virtual-account`);
  }

  getWallet(customerId: number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/wallet/${customerId}`);
  }

  getPortfolioSummary(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/portfolioSummary`);
  }

  getHoldings(customerId: number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/holdings/${customerId}`);
  }

  getHistory(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/history`);
  }

  initiateWithdrawal(data: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/withdraw`, data);
  }

  sendWithdrawalOtp(customerId: number, amount: number): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/send-withdrawal-otp`, { customerId, amount });
  }
}
