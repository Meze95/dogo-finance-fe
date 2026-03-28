import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

export interface PermissionItem {
  label: string;
  selected: boolean;
  checkboxClass: string;
  textHoverClass: string;
}

export interface PermissionGroup {
  groupName: string;
  permissions: PermissionItem[];
}

export interface ModuleAccess {
  name: string;
  icon: string;
  description: string;
  groups: PermissionGroup[];
}

@Component({
  selector: 'app-access-right',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './access-right.component.html',
  styleUrl: './access-right.component.css'
})
export class AccessRightComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  roleId = signal<string>('');
  roleName = signal<string>('Loading Role...');
  
  // Toast State
  showToast = signal(false);

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

  // Redesigned Modules strictly following the DogoFinance Domain
  modules = signal<ModuleAccess[]>([
    {
      name: 'User Management',
      icon: 'ri-group-line',
      description: 'Manage individual client accounts, profiles, and verification statuses.',
      groups: [
        {
          groupName: 'Client Operations',
          permissions: [
            { label: 'View Clients', selected: true, checkboxClass: this.styleMap.view.check, textHoverClass: this.styleMap.view.text },
            { label: 'Edit Profiles', selected: false, checkboxClass: this.styleMap.edit.check, textHoverClass: this.styleMap.edit.text },
            { label: 'Suspend Accounts', selected: false, checkboxClass: this.styleMap.delete.check, textHoverClass: this.styleMap.delete.text }
          ]
        },
        {
          groupName: 'KYC & Verifications',
          permissions: [
            { label: 'View Documents', selected: true, checkboxClass: this.styleMap.view.check, textHoverClass: this.styleMap.view.text },
            { label: 'Approve BVN/NIN', selected: false, checkboxClass: this.styleMap.special.check, textHoverClass: this.styleMap.special.text },
            { label: 'Reject Verifications', selected: false, checkboxClass: this.styleMap.delete.check, textHoverClass: this.styleMap.delete.text },
            { label: 'Request Resubmission', selected: false, checkboxClass: this.styleMap.create.check, textHoverClass: this.styleMap.create.text }
          ]
        }
      ]
    },
    {
      name: 'Mudarabah Pools (Investments)',
      icon: 'ri-building-line',
      description: 'Comprehensive control over Shariah-compliant asset pools & yields.',
      groups: [
        {
          groupName: 'Pool Operations',
          permissions: [
            { label: 'View Pools', selected: true, checkboxClass: this.styleMap.view.check, textHoverClass: this.styleMap.view.text },
            { label: 'Create Pool', selected: false, checkboxClass: this.styleMap.create.check, textHoverClass: this.styleMap.create.text },
            { label: 'Edit Terms', selected: false, checkboxClass: this.styleMap.edit.check, textHoverClass: this.styleMap.edit.text },
            { label: 'Close Pool', selected: false, checkboxClass: this.styleMap.delete.check, textHoverClass: this.styleMap.delete.text }
          ]
        },
        {
          groupName: 'Yield Distribution',
          permissions: [
            { label: 'View Distribution', selected: true, checkboxClass: this.styleMap.view.check, textHoverClass: this.styleMap.view.text },
            { label: 'Calculate Yields', selected: false, checkboxClass: this.styleMap.create.check, textHoverClass: this.styleMap.create.text },
            { label: 'Approve Payouts', selected: false, checkboxClass: this.styleMap.special.check, textHoverClass: this.styleMap.special.text }
          ]
        }
      ]
    },
    {
      name: 'Transactions & Finance',
      icon: 'ri-money-dollar-circle-line',
      description: 'Manage client deposits, withdrawals, and platform balances.',
      groups: [
        {
          groupName: 'Deposits',
          permissions: [
            { label: 'View Deposits', selected: true, checkboxClass: this.styleMap.view.check, textHoverClass: this.styleMap.view.text },
            { label: 'Manual Credit', selected: false, checkboxClass: this.styleMap.create.check, textHoverClass: this.styleMap.create.text },
            { label: 'Flag Discrepancy', selected: false, checkboxClass: this.styleMap.edit.check, textHoverClass: this.styleMap.edit.text }
          ]
        },
        {
          groupName: 'Withdrawals',
          permissions: [
            { label: 'View Requests', selected: true, checkboxClass: this.styleMap.view.check, textHoverClass: this.styleMap.view.text },
            { label: 'Approve Payout', selected: false, checkboxClass: this.styleMap.special.check, textHoverClass: this.styleMap.special.text },
            { label: 'Reject Payout', selected: false, checkboxClass: this.styleMap.delete.check, textHoverClass: this.styleMap.delete.text }
          ]
        }
      ]
    },
    {
      name: 'Compliance & Shariah',
      icon: 'ri-scale-3-line',
      description: 'Audit system parameters mapping strictly to Halal investments.',
      groups: [
        {
          groupName: 'Shariah Auditing',
          permissions: [
            { label: 'View Audit Logs', selected: true, checkboxClass: this.styleMap.view.check, textHoverClass: this.styleMap.view.text },
            { label: 'Certify Asset', selected: false, checkboxClass: this.styleMap.special.check, textHoverClass: this.styleMap.special.text },
            { label: 'Flag Non-Compliance', selected: false, checkboxClass: this.styleMap.delete.check, textHoverClass: this.styleMap.delete.text }
          ]
        }
      ]
    },
    {
      name: 'Admin Roles Matrix',
      icon: 'ri-shield-keyhole-line',
      description: 'Manage administrative roles and their systemic access privileges.',
      groups: [
        {
          groupName: 'Role Management',
          permissions: [
            { label: 'View Roles', selected: true, checkboxClass: this.styleMap.view.check, textHoverClass: this.styleMap.view.text },
            { label: 'Create Role', selected: false, checkboxClass: this.styleMap.create.check, textHoverClass: this.styleMap.create.text },
            { label: 'Edit Role', selected: false, checkboxClass: this.styleMap.edit.check, textHoverClass: this.styleMap.edit.text },
            { label: 'Delete Role', selected: false, checkboxClass: this.styleMap.delete.check, textHoverClass: this.styleMap.delete.text },
            { label: 'Edit Access Matrix', selected: false, checkboxClass: this.styleMap.special.check, textHoverClass: this.styleMap.special.text }
          ]
        }
      ]
    }
  ]);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.roleId.set(id);
        this.fetchRoleMock(id);
      }
    });
  }

  fetchRoleMock(id: string) {
    const roleMap: Record<string, string> = {
      '1': 'BizP Solutions',
      '2': 'Super Administrator',
      '3': 'Compliance Officer',
      '4': 'Investment Manager',
      '5': 'Support Agent'
    };
    
    this.roleName.set(roleMap[id] || 'Custom Administrator Role');
  }

  setActiveModule(index: number) {
    this.activeModuleIndex.set(index);
  }

  updateAccess() {
    console.log('Updating access rights for role ID:', this.roleId(), 'Payload:', this.modules());
    // Show custom Toast instead of window.alert()
    this.showToast.set(true);
    setTimeout(() => {
      this.showToast.set(false);
      this.router.navigate(['/admin/roles']);
    }, 2000);
  }
}
