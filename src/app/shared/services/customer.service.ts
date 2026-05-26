import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TodoItem {
  title: string;
  subtitle: string;
  actionText: string;
  actionType: string;
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Customer`;

  getTodoList(customerId: number | string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${customerId}/todo`);
  }

  getRelationshipTypes(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/relationship-types`);
  }

  addNextOfKin(customerId: number | string, data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${customerId}/next-of-kin`, data);
  }

  verifyBvn(customerId: number | string, bvn: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${customerId}/verify-bvn`, { bvn });
  }

  verifyNin(customerId: number | string, nin: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${customerId}/verify-nin`, { nin });
  }

  getAddressDocTypes(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/address-doc-types`);
  }

  verifyAddress(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/verify-address`, formData);
  }

  getCompanyBankDetails(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/company-bank-details`);
  }
}
