import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BankService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Bank`;

  getBanks(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/all`);
  }

  getMyBanks(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/accounts`);
  }

  addBank(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/accounts`, data);
  }

  deleteBank(customerBankId: number | string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/accounts/${customerBankId}`);
  }

  setDefaultBank(customerBankId: number | string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/accounts/${customerBankId}/default`, {});
  }
}
