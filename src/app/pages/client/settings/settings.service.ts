import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { of, delay, Observable, map, tap } from 'rxjs';
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

export interface RelationshipType {
  id: number;
  name: string;
}

export interface NextOfKin {
  fullName: string;
  relationship: string; // The Name (e.g. Spouse)
  relationshipId?: number; // The numeric ID for the backend
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
    const user = this.authService.currentUser();
    return user?.CustomerId || user?.customerId || user?.userId || 0;
  }

  // Cache for relationship types to help with mapping
  private _relationshipTypes: RelationshipType[] = [];

  // Profile
  getProfile(): Observable<ApiResponse<UserProfile>> {
    return this.http.get<ApiResponse<UserProfile>>(`${this.apiUrl}/Customer/profile`);
  }

  updateProfile(profileData: Partial<UserProfile>) {
    return this.http.post<ApiResponse>(`${this.apiUrl}/Customer/update-profile`, profileData);
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
            fullName: data.fullName || data.name,
            email: data.email,
            phone: data.phoneNumber || data.phone,
            relationship: data.relationshipType?.name || data.relationshipName || "Other",
            relationshipId: data.relationshipTypeId
          } as NextOfKin
        };
      })
    );
  }

  addNextOfKin(kinData: NextOfKin) {
    const payload = {
      FullName: kinData.fullName,
      RelationshipTypeId: kinData.relationshipId || 1, // Default to 1 if not set
      PhoneNumber: kinData.phone,
      Email: kinData.email,
      Address: "Not Provided"
    };
    return this.http.post<ApiResponse>(`${this.apiUrl}/Customer/${this.customerId}/next-of-kin`, payload);
  }
  
  updateNextOfKin(kinData: NextOfKin) {
    const payload = {
      FullName: kinData.fullName,
      RelationshipTypeId: kinData.relationshipId || 1,
      PhoneNumber: kinData.phone,
      Email: kinData.email,
      Address: "Not Provided"
    };
    return this.http.put<ApiResponse>(`${this.apiUrl}/Customer/${this.customerId}/next-of-kin`, payload);
  }
  
  // Security
  setupTransactionPin(data: { pin: string, confirmPin: string }) {
    const payload = {
      Pin: data.pin,
      ConfirmPin: data.confirmPin
    };
    return this.http.post<ApiResponse>(`${this.apiUrl}/Auth/pin/setup`, payload);
  }

  updateTransactionPin(pinData: TransactionPinUpdate) {
    return this.http.post<ApiResponse>(`${this.apiUrl}/Auth/pin/change`, pinData);
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

  getRelationshipTypes(): Observable<ApiResponse<RelationshipType[]>> {
    return this.http.get<ApiResponse<RelationshipType[]>>(`${this.apiUrl}/Customer/relationship-types`).pipe(
      tap(res => {
        if (res.data) this._relationshipTypes = res.data;
      })
    );
  }
}
