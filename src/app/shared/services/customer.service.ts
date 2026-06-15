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

  getCorporateProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/corporate-profile`);
  }

  updateCorporateProfile(data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/corporate-profile`, data);
  }

  getPrimaryContact(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/primary-contact`);
  }

  updatePrimaryContact(data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/primary-contact`, data);
  }

  getCountries(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/countries`);
  }

  getStates(countryId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/states/${countryId}`);
  }

  getNatureOfBusinesses(): Observable<any> {
    return this.http.get(`${this.apiUrl}/nature-of-businesses`);
  }

  getSourceOfFunds(): Observable<any> {
    return this.http.get(`${this.apiUrl}/source-of-funds`);
  }

  getCorporateVerifications(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/corporate-verifications`);
  }

  uploadCorporateDocument(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/corporate-document`, formData);
  }

  getCorporateSignatories(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/signatories`);
  }

  addCorporateSignatory(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/signatories`, formData);
  }

  deleteCorporateSignatory(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/signatories/${id}`);
  }

  getCorporateDirectors(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/directors`);
  }

  addCorporateDirector(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/directors`, formData);
  }

  deleteCorporateDirector(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/directors/${id}`);
  }

  // --- NOTIFICATIONS ---
  getNotifications(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/notifications`);
  }

  markNotificationRead(notificationId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/notifications/${notificationId}/read`, {});
  }
}
