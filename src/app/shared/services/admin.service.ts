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
}
