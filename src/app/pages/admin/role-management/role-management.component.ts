import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../shared/services/admin.service';

export interface CustomRole {
  id: number;
  name: string;
  description?: string;
  isSystemGenerated?: boolean;
  dateCreated?: string;
}

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './role-management.component.html',
  styleUrl: './role-management.component.css'
})
export class RoleManagementComponent {
  private adminService = inject(AdminService);
  private router = inject(Router);

  roles = signal<any[]>([]);
  isProcessing = signal(false);

  // Modal State
  isModalOpen = signal(false);
  editingRole = signal<CustomRole | null>(null);

  // Form Model
  roleForm = signal({ name: '', description: '' });

  ngOnInit() {
    this.refreshRoles();
  }

  refreshRoles() {
    this.isProcessing.set(true);
    this.adminService.getRoles().subscribe({
      next: (res) => {
        this.roles.set(res.data);
        this.isProcessing.set(false);
      },
      error: () => this.isProcessing.set(false)
    });
  }

  openModal(role: CustomRole | null = null) {
    this.editingRole.set(role);
    if (role) {
      this.roleForm.set({ name: role.name, description: role.description || '' });
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

    this.isProcessing.set(true);
    const payload = {
      id: this.editingRole()?.id || 0,
      name: data.name
      // description: data.description // TblRole doesn't have description currently, but we can extend if needed.
    };

    this.adminService.saveRole(payload).subscribe({
      next: () => {
        this.refreshRoles();
        this.closeModal();
      },
      error: () => this.isProcessing.set(false)
    });
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
       this.adminService.deleteRole(Number(id)).subscribe({
         next: () => {
            this.refreshRoles();
            this.cancelDelete();
         }
       });
    }
  }
}
