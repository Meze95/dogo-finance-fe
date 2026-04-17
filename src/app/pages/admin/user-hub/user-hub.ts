import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../shared/services/admin.service';

interface User {
  id: string;
  userName: string;
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
export class UserHub implements OnInit {
  private adminService = inject(AdminService);
  
  users = signal<User[]>([]);
  allRoles = signal<any[]>([]);
  isProcessing = signal(false);

  ngOnInit() {
    this.loadAdmins();
    this.loadRoles();
  }

  loadRoles() {
    this.adminService.getRoles().subscribe({
      next: (res) => {
        // Standardize keys to lowercase for the frontend
        const normalizedRoles = (res.data || []).map((r: any) => ({
          id: r.id || r.Id || r.ID,
          name: r.name || r.Name
        }));
        console.log('Normalized Roles:', normalizedRoles);
        this.allRoles.set(normalizedRoles);
      },
      error: (err) => console.error('Failed to load roles', err)
    });
  }

  loadAdmins() {
    this.isProcessing.set(true);
    this.adminService.getAdmins().subscribe({
      next: (res) => {
        const rawData = res.data || [];
        console.log('Raw Admin Data:', rawData);

        // Map backend TblUser properties to frontend User interface
        const mappedUsers: User[] = rawData.map((u: any) => ({
          id: String(u.userId || u.UserId),
          userName: u.userName || u.UserName || '',
          firstName: u.firstName || u.FirstName || '',
          lastName: u.lastName || u.LastName || '',
          email: u.email || u.Email || '',
          phone: u.phoneNumber || u.PhoneNumber || '',
          role: u.role || (u.tblUserRoles?.[0]?.role?.name) || 'Admin', // Fallback
          status: u.isActive === false ? 'Unverified' : 'Verified',
          accountStatus: u.isLocked === true || u.isActive === false ? 'Locked' : 'Active',
          dateJoined: u.createdAt || u.CreatedAt ? new Date(u.createdAt || u.CreatedAt).toLocaleDateString() : ''
        }));

        this.users.set(mappedUsers);
        this.isProcessing.set(false);
      },
      error: () => this.isProcessing.set(false)
    });
  }

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

  // Modals state
  isModalOpen = signal(false);
  isDeleteModalOpen = signal(false);
  editingUser = signal<User | null>(null);
  userToDelete = signal<string | null>(null);

  // Custom Dropdown State
  isRoleDropdownOpen = signal(false);

  // Other state
  resendingMap = signal<Record<string, boolean>>({});

  // Form State
  formUsername = signal('');
  formEmail = signal('');
  formPhone = signal('');
  formRole = signal('');

  openModal(user?: User | any) {
    if (user) {
      this.editingUser.set(user);
      this.formUsername.set(user.userName || user.UserName || '');
      this.formEmail.set(user.email || user.Email || '');
      this.formPhone.set(user.phone || user.Phone || user.phoneNumber || user.PhoneNumber || '');
      this.formRole.set(user.role || user.Role || '');
    } else {
      this.editingUser.set(null);
      this.formUsername.set('');
      this.formEmail.set('');
      this.formPhone.set('');
      this.formRole.set('');
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
    console.log('Selected Role:', role);
    this.formRole.set(role);
    this.isRoleDropdownOpen.set(false);
  }

  submitUser() {
    const username = this.formUsername();
    const email = this.formEmail();
    const phone = this.formPhone();
    const role = this.formRole();
    
    if (!username || !email || !phone || !role) return;

    this.isProcessing.set(true);

    // Find Role ID (Case-insensitive)
    const selectedRole = this.allRoles().find(r => 
      String(r.name).toLowerCase().trim() === String(role).toLowerCase().trim()
    );
    const roleId = selectedRole?.id || 2; // Default to Admin if not found

    const nameParts = username.trim().split(' ');
    const fName = nameParts[0] || 'Admin';
    const lName = nameParts.slice(1).join(' ') || 'User';

    const request = {
      userData: {
        firstName: fName,
        lastName: lName,
        email: email,
        phoneNumber: phone,
        password: "StaffPass1234!", // Dummy to pass backend validation, backend will use its own default
        confirmPassword: "StaffPass1234!",
        dateOfBirth: "2000-01-01" // Dummy for staff
      },
      roleId: roleId
    };

    const currentEditing = this.editingUser();
    if (currentEditing) {
      this.adminService.updateAdmin(currentEditing.id, request).subscribe({
        next: (res) => {
          this.isProcessing.set(false);
          this.loadAdmins();
          this.closeModal();
        },
        error: (err) => {
          this.isProcessing.set(false);
          console.error('Failed to update user', err);
        }
      });
    } else {
      this.adminService.createAdmin(request).subscribe({
        next: (res) => {
          this.isProcessing.set(false);
          this.loadAdmins();
          this.closeModal();
        },
        error: (err) => {
          this.isProcessing.set(false);
          console.error('Failed to save user', err);
        }
      });
    }
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
