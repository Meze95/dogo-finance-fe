import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  status: 'Verified' | 'Unverified';
  accountStatus: 'Active' | 'Locked';
  dateJoined: string;
}

@Component({
  selector: 'app-user-hub',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-hub.html',
  styleUrl: './user-hub.css',
})
export class UserHub {
  users = signal<User[]>([
    { id: '1', firstName: 'Kabir', lastName: 'Ademola', email: 'kabir@dogofinance.com', phone: '08012345678', role: 'Super Admin', status: 'Verified', accountStatus: 'Active', dateJoined: '01/10/2026' },
    { id: '2', firstName: 'Fatima', lastName: 'Yusuf', email: 'f.yusuf@dogofinance.com', phone: '08123456789', role: 'Compliance Officer', status: 'Verified', accountStatus: 'Active', dateJoined: '02/14/2026' },
    { id: '3', firstName: 'Chukwudi', lastName: 'Eze', email: 'c.eze@dogofinance.com', phone: '09012345678', role: 'Investment Manager', status: 'Unverified', accountStatus: 'Active', dateJoined: '02/20/2026' },
    { id: '4', firstName: 'Aisha', lastName: 'Bello', email: 'a.bello@dogofinance.com', phone: '07012345678', role: 'Support Agent', status: 'Verified', accountStatus: 'Locked', dateJoined: '03/05/2026' }
  ]);

  searchQuery = signal('');

  filteredUsers = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.users();

    return this.users().filter(u => 
      u.firstName.toLowerCase().includes(query) ||
      u.lastName.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.phone.includes(query)
    );
  });

  roles = ['Super Admin', 'Compliance Officer', 'Investment Manager', 'Support Agent'];

  // Modals state
  isModalOpen = signal(false);
  isDeleteModalOpen = signal(false);
  editingUser = signal<User | null>(null);
  userToDelete = signal<string | null>(null);

  // Custom Dropdown State
  isRoleDropdownOpen = signal(false);

  // Loading states
  isProcessing = signal(false);
  resendingMap = signal<Record<string, boolean>>({});

  // Form State
  userForm = signal({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'Support Agent'
  });

  openModal(user?: User) {
    if (user) {
      this.editingUser.set(user);
      this.userForm.set({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role
      });
    } else {
      this.editingUser.set(null);
      this.userForm.set({ firstName: '', lastName: '', email: '', phone: '', role: 'Support Agent' });
    }
    this.isRoleDropdownOpen.set(false);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingUser.set(null);
  }

  toggleRoleDropdown() {
    this.isRoleDropdownOpen.update(v => !v);
  }

  selectRole(role: string) {
    this.userForm.update(form => ({ ...form, role }));
    this.isRoleDropdownOpen.set(false);
  }

  submitUser() {
    const form = this.userForm();
    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.role) return;

    this.isProcessing.set(true);

    setTimeout(() => {
      const currentEditing = this.editingUser();
      
      if (currentEditing) {
        this.users.update(draft => 
          draft.map(u => u.id === currentEditing.id ? { ...u, firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone, role: form.role } : u)
        );
      } else {
        const newUser: User = {
          id: Math.random().toString(36).substring(2, 9),
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          role: form.role,
          status: 'Unverified',
          accountStatus: 'Active',
          dateJoined: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
        };
        this.users.update(draft => [...draft, newUser]);
      }

      this.isProcessing.set(false);
      this.closeModal();
    }, 800);
  }

  confirmDelete(id: string) {
    this.userToDelete.set(id);
    this.isDeleteModalOpen.set(true);
  }

  cancelDelete() {
    this.isDeleteModalOpen.set(false);
    this.userToDelete.set(null);
  }

  processDelete() {
    const id = this.userToDelete();
    if (!id) return;
    
    this.isProcessing.set(true);
    setTimeout(() => {
      this.users.update(draft => draft.filter(u => u.id !== id));
      this.isProcessing.set(false);
      this.cancelDelete();
    }, 600);
  }

  resendVerification(id: string) {
    this.resendingMap.update(map => ({ ...map, [id]: true }));
    
    setTimeout(() => {
      this.resendingMap.update(map => ({ ...map, [id]: false }));
    }, 1500);
  }
}
