import { Injectable } from '@angular/core';
import { of, delay } from 'rxjs';

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
  id?: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  
  // Profile
  updateProfile(profileData: Partial<UserProfile>) {
    console.log('API Call: updateProfile', profileData);
    return of({ success: true, data: profileData }).pipe(delay(1000));
  }

  updateProfilePicture(base64Image: string) {
    console.log('API Call: updateProfilePicture');
    return of({ success: true, avatar: base64Image }).pipe(delay(1000));
  }

  // Verifications
  verifyIdentityDocument(type: 'BVN' | 'NIN', documentNumber: string) {
    console.log(`API Call: verifyIdentityDocument (${type})`, documentNumber);
    return of({ success: true }).pipe(delay(1500));
  }
  
  // Wealth Legacy
  addNextOfKin(kinData: NextOfKin) {
    console.log('API Call: addNextOfKin', kinData);
    return of({ success: true, data: kinData }).pipe(delay(1000));
  }
  
  updateNextOfKin(kinData: NextOfKin) {
    console.log('API Call: updateNextOfKin', kinData);
    return of({ success: true, data: kinData }).pipe(delay(1000));
  }
  
  // Security
  updateTransactionPin(pinData: TransactionPinUpdate) {
    console.log('API Call: updateTransactionPin', pinData);
    return of({ success: true }).pipe(delay(1000));
  }

  updateLoginPin(pinData: TransactionPinUpdate) {
    console.log('API Call: updateLoginPin', pinData);
    return of({ success: true }).pipe(delay(1000));
  }

  updateTwoFactorAuth(enabled: boolean) {
    console.log('API Call: updateTwoFactorAuth', enabled);
    return of({ success: true, enabled }).pipe(delay(1000));
  }

  // Bank Accounts
  addBankAccount(account: BankAccount) {
    console.log('API Call: addBankAccount', account);
    return of({ success: true, data: { ...account, id: Math.random().toString() } }).pipe(delay(1000));
  }
  
  deleteBankAccount(id: string) {
    console.log('API Call: deleteBankAccount', id);
    return of({ success: true }).pipe(delay(1000));
  }
}
