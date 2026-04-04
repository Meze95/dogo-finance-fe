import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { of, delay, Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../shared/services/auth.service';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  status: number;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
  tier: string;
}

export interface NextOfKin {
  fullName: string;
  relationship: string;
  email: string;
  phone: string;
}

export interface TransactionPinUpdate {
  oldPin?: string;
  newPin: string;
}

export interface BankAccount {
  customerBankId?: number;
  bankId: number;
  bankName: string;
  bankLogo?: string;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
}

export interface Bank {
  bankId: number;
  bankName: string;
  bankCode: string;
  logoUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  private get customerId() {
    return this.authService.currentUser()?.CustomerId || 0;
  }

  // Profile
  updateProfile(profileData: Partial<UserProfile>) {
    return this.http.post<ApiResponse>(`${this.apiUrl}/Auth/update-profile`, profileData);
  }

  updateProfilePicture(base64Image: string) {
    return this.http.post<ApiResponse>(`${this.apiUrl}/Auth/avatar`, { image: base64Image });
  }

  // Verifications
  verifyIdentityDocument(type: 'BVN' | 'NIN', documentNumber: string) {
    return this.http.post<ApiResponse>(`${this.apiUrl}/KYC/verify`, { type, documentNumber });
  }
  
  // Wealth Legacy
  getNextOfKin(): Observable<ApiResponse<NextOfKin | null>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/Customer/${this.customerId}/next-of-kin`).pipe(
      map(res => {
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        if (!data) return { ...res, data: null };
        
        return {
          ...res,
          data: {
            fullName: data.fullName || data.FullName,
            email: data.email || data.Email,
            phone: data.phoneNumber || data.PhoneNumber || data.phone,
            relationship: data.relationshipType?.type || data.RelationshipType?.Type || data.relationship
          } as NextOfKin
        };
      })
    );
  }

  addNextOfKin(kinData: NextOfKin) {
    return this.http.post<ApiResponse>(`${this.apiUrl}/Customer/${this.customerId}/next-of-kin`, kinData);
  }
  
  updateNextOfKin(kinData: NextOfKin) {
    return this.http.put<ApiResponse>(`${this.apiUrl}/Customer/${this.customerId}/next-of-kin`, kinData);
  }
  
  // Security
  updateTransactionPin(pinData: TransactionPinUpdate) {
    return this.http.post<ApiResponse>(`${this.apiUrl}/Auth/pin/change`, pinData);
  }

  updateLoginPin(pinData: TransactionPinUpdate) {
    return this.http.post<ApiResponse>(`${this.apiUrl}/Auth/change-password`, { oldPassword: pinData.oldPin, newPassword: pinData.newPin });
  }

  updateTwoFactorAuth(enabled: boolean) {
    return this.http.post<ApiResponse>(`${this.apiUrl}/Auth/2fa/toggle?status=${enabled}`, {});
  }

  // Bank Accounts
  getBanks(): Observable<ApiResponse<Bank[]>> {
    return this.http.get<ApiResponse<Bank[]>>(`${this.apiUrl}/Bank/all`);
  }

  getMyBanks(): Observable<ApiResponse<BankAccount[]>> {
    return this.http.get<ApiResponse<BankAccount[]>>(`${this.apiUrl}/Bank/accounts`);
  }

  addBankAccount(account: Partial<BankAccount>): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/Bank/accounts`, account);
  }
  
  deleteBankAccount(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/Bank/accounts/${id}`);
  }

  setDefaultBank(id: number): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/Bank/accounts/${id}/default`, {});
  }

  getRelationshipTypes(): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/Customer/relationship-types`);
  }
}
