import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

export interface CustomRole {
  id: string;
  name: string;
  description: string;
  isSystemGenerated: boolean;
  dateCreated: string;
}

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './role-management.component.html',
  styleUrl: './role-management.component.css'
})
export class RoleManagementComponent {
  // Sample Data matching the expected schema
  roles = signal<CustomRole[]>([
    { id: '1', name: 'Super Administrator', description: 'Full system access', isSystemGenerated: true, dateCreated: '01/15/2026' },
    { id: '2', name: 'Compliance Officer', description: 'Can review and verify user KYC', isSystemGenerated: false, dateCreated: '02/10/2026' },
    { id: '3', name: 'Investment Manager', description: 'Manages mudarabah pools & investments', isSystemGenerated: false, dateCreated: '02/20/2026' },
    { id: '4', name: 'Support Agent', description: 'Handles tier 1 support tickets', isSystemGenerated: false, dateCreated: '03/05/2026' }
  ]);

  // Modal State
  isModalOpen = signal(false);
  editingRole = signal<CustomRole | null>(null);

  // Form Model
  roleForm = signal({ name: '', description: '' });

  constructor(private router: Router) {}

  openModal(role: CustomRole | null = null) {
    this.editingRole.set(role);
    if (role) {
      this.roleForm.set({ name: role.name, description: role.description });
    } else {
      this.roleForm.set({ name: '', description: '' });
    }
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    setTimeout(() => {
      this.editingRole.set(null);
      this.roleForm.set({ name: '', description: '' });
    }, 200); // fade out duration
  }

  submitRole() {
    const data = this.roleForm();
    if (!data.name) return;

    if (this.editingRole()) {
      // Update
      this.roles.update(r => r.map(role => 
        role.id === this.editingRole()?.id 
          ? { ...role, name: data.name, description: data.description } 
          : role
      ));
    } else {
      // Create
      const newRole: CustomRole = {
        id: Math.random().toString(36).substring(2, 9),
        name: data.name,
        description: data.description,
        isSystemGenerated: false,
        dateCreated: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
      };
      this.roles.update(r => [newRole, ...r]);
    }
    this.closeModal();
  }

  deleteRole(id: string) {
    // legacy method, replaced by confirmDelete and processDelete
  }

  // Delete Modal State
  isDeleteModalOpen = signal(false);
  roleToDelete = signal<string | null>(null);

  confirmDelete(id: string) {
    this.roleToDelete.set(id);
    this.isDeleteModalOpen.set(true);
  }

  cancelDelete() {
    this.isDeleteModalOpen.set(false);
    setTimeout(() => this.roleToDelete.set(null), 200);
  }

  processDelete() {
    const id = this.roleToDelete();
    if (id) {
       this.roles.update(r => r.filter(role => role.id !== id));
    }
    this.cancelDelete();
  }
}
