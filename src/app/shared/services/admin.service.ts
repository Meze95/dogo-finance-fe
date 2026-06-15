import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Admin`;

  // --- CLIENTS ---
  getClients(): Observable<any> {
    return this.http.get(`${this.apiUrl}/clients`);
  }

  // --- STAFF ---
  getAdmins(): Observable<any> {
    return this.http.get(`${this.apiUrl}/list`);
  }

  createAdmin(data: { userData: any, roleId: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, data);
  }

  updateAdmin(userId: string | number, data: { userData: any, roleId: number }): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${userId}`, data);
  }

  // --- ROLES ---
  getRoles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/roles`);
  }

  saveRole(role: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/roles`, role);
  }

  deleteRole(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/roles/${id}`);
  }

  // --- ACCESS RIGHTS ---
  getAccessRights(roleId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/roles/${roleId}/access-rights`);
  }

  updateAccessRights(roleId: number, accessRightIds: number[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/roles/${roleId}/access-rights`, accessRightIds);
  }

  // --- ADDRESS VERIFICATIONS ---
  getAddressVerifications(status?: string): Observable<any> {
    const url = status ? `${this.apiUrl}/address-verifications?status=${status}` : `${this.apiUrl}/address-verifications`;
    return this.http.get(url);
  }

  reviewAddressVerification(data: { 
    verificationId: number, 
    approved: boolean, 
    adminNotes?: string,
    correctedAddress?: string,
    correctedCity?: string,
    correctedState?: string
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/address-verifications/review`, data);
  }

  // --- SETTINGS ---
  getSettings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/settings`);
  }

  updateSettings(settings: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/settings`, settings);
  }

  getCompanyProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/company-profile`);
  }

  updateCompanyProfile(profile: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/company-profile`, profile);
  }

  // --- WITHDRAWALS ---
  getWithdrawals(status?: string): Observable<any> {
    const url = status ? `${this.apiUrl}/withdrawals?status=${status}` : `${this.apiUrl}/withdrawals`;
    return this.http.get(url);
  }

  reviewWithdrawalRequest(data: { requestId: number, approved: boolean, adminNotes?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/withdrawals/review`, data);
  }

  // --- MANUAL FUNDING ---
  getManualFundingRequests(status?: string): Observable<any> {
    const url = status ? `${this.apiUrl}/manual-funding?status=${status}` : `${this.apiUrl}/manual-funding`;
    return this.http.get(url);
  }

  reviewManualFundingRequest(data: { requestId: number, status: 'Approved' | 'Rejected', adminNotes?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/manual-funding/review`, data);
  }

  // --- CORPORATE HUB ---
  getCorporateRegistrations(): Observable<any> {
    return this.http.get(`${this.apiUrl}/corporate-registrations`);
  }

  reviewCorporateDocument(customerId: string | number, documentId: string | number, data: { approved: boolean, adminNotes?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/corporate-registrations/${customerId}/documents/${documentId}/review`, data);
  }

  reviewCorporateRegistration(customerId: string | number, data: { approved: boolean, adminNotes?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/corporate-registrations/${customerId}/review`, data);
  }

  reviewCorporateDirector(directorId: string | number, data: { approved: boolean, adminNotes?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/corporate-registrations/directors/${directorId}/review`, data);
  }

  reviewCorporateSignatory(signatoryId: string | number, data: { approved: boolean, adminNotes?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/corporate-registrations/signatories/${signatoryId}/review`, data);
  }
}
