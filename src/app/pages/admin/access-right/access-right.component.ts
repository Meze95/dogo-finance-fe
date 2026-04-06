import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../shared/services/admin.service';

export interface PermissionItem {
  id: number;
  name: string;
  label: string;
  isSelected: boolean;
  checkboxClass: string;
  textHoverClass: string;
}

export interface PermissionGroup {
  groupName: string;
  permissions: PermissionItem[];
}

export interface ModuleAccess {
  id: number;
  name: string;
  icon: string;
  description: string;
  permissions: PermissionItem[];
}

@Component({
  selector: 'app-access-right',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './access-right.component.html',
  styleUrl: './access-right.component.css'
})
export class AccessRightComponent implements OnInit {
  private adminService = inject(AdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  roleId = signal<number>(0);
  roleName = signal<string>('Loading Role...');
  
  // Toast State
  showToast = signal(false);
  isProcessing = signal(false);

  // Active Module State for Master-Detail View
  activeModuleIndex = signal<number>(0);

  // Helper styles for permissions
  private styleMap = {
    view: { check: 'text-[#1B4332] checked:bg-[#1B4332] checked:border-[#1B4332]', text: 'group-hover/checkbox:text-[#1B4332]' },
    create: { check: 'text-[#C9A84C] checked:bg-[#C9A84C] checked:border-[#C9A84C]', text: 'group-hover/checkbox:text-[#C9A84C]' },
    edit: { check: 'text-blue-500 checked:bg-blue-500 checked:border-blue-500', text: 'group-hover/checkbox:text-blue-500' },
    delete: { check: 'text-red-500 checked:bg-red-500 checked:border-red-500', text: 'group-hover/checkbox:text-red-500' },
    special: { check: 'text-indigo-500 checked:bg-indigo-500 checked:border-indigo-500', text: 'group-hover/checkbox:text-indigo-500' }
  };

  modules = signal<ModuleAccess[]>([]);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.roleId.set(Number(id));
        this.loadHierarchy();
      }
    });
  }

  loadHierarchy() {
    this.isProcessing.set(true);
    this.adminService.getAccessRights(this.roleId()).subscribe({
      next: (res) => {
        // Enforce UI styles on the DB data
        const data = res.data.map((m: any) => ({
          ...m,
          permissions: m.permissions.map((p: any) => ({
            ...p,
            checkboxClass: this.getStyleForPermission(p.name).check,
            textHoverClass: this.getStyleForPermission(p.name).text
          }))
        }));
        this.modules.set(data);
        this.isProcessing.set(false);
      },
      error: () => this.isProcessing.set(false)
    });
  }

  private getStyleForPermission(name: string) {
    if (name.includes('View') || name.includes('List')) return this.styleMap.view;
    if (name.includes('Create') || name.includes('Add')) return this.styleMap.create;
    if (name.includes('Edit') || name.includes('Update')) return this.styleMap.edit;
    if (name.includes('Delete') || name.includes('Suspend')) return this.styleMap.delete;
    return this.styleMap.special;
  }

  setActiveModule(index: number) {
    this.activeModuleIndex.set(index);
  }

  updateAccess() {
    const selectedIds: number[] = [];
    this.modules().forEach(m => {
      m.permissions.forEach(p => {
        if (p.isSelected) selectedIds.push(p.id);
      });
    });

    this.isProcessing.set(true);
    this.adminService.updateAccessRights(this.roleId(), selectedIds).subscribe({
      next: () => {
        this.showToast.set(true);
        setTimeout(() => {
          this.showToast.set(false);
          this.router.navigate(['/admin/roles']);
        }, 2000);
      },
      error: () => this.isProcessing.set(false)
    });
  }
}
