import { Component, OnInit } from '@angular/core';

import { RoleAccessService, RolePermission } from '../services/role-access';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-role-access',
  imports: [],
  templateUrl: './role-access.html',
  styleUrl: './role-access.css'
})
export class RoleAccess implements OnInit {

  roles: string[] = [];
  screens: string[] = [];
  permissions: RolePermission[] = [];

  loading = true;
  saving = false;
  hasChanges = false;

  private screenLabels: Record<string, string> = {
    PRODUCTS: 'Product Management',
    EMPLOYEES: 'Employee Management',
    ASSET_ASSIGNMENT: 'Asset Assignment',
    ASSIGNMENT_REGISTER: 'Assignment Register',
    MASTER_DATA: 'Master Data'
  };

  private roleLabels: Record<string, string> = {
    ADMIN: 'Admin',
    EMPLOYEE: 'Employee'
  };

  constructor(
    private roleAccessService: RoleAccessService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;

    this.roleAccessService.getMatrix().subscribe({
      next: (data) => {
        this.roles = data.roles;
        this.screens = data.screens;
        this.permissions = data.permissions;
        this.hasChanges = false;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading role access:', error);
        this.loading = false;
        alert(error.error?.message || 'Failed to load role access');
      }
    });
  }

  screenLabel(screen: string): string {
    return this.screenLabels[screen] || screen;
  }

  roleLabel(role: string): string {
    return this.roleLabels[role] || role;
  }

  isLocked(role: string): boolean {
    return role === 'ADMIN';
  }

  private find(role: string, screen: string): RolePermission | undefined {
    return this.permissions.find((p) => p.role === role && p.screen === screen);
  }

  canView(role: string, screen: string): boolean {
    return this.isLocked(role) || !!this.find(role, screen)?.canView;
  }

  canEdit(role: string, screen: string): boolean {
    return this.isLocked(role) || !!this.find(role, screen)?.canEdit;
  }

  toggleView(role: string, screen: string, checked: boolean): void {

    const row = this.find(role, screen);
    if (!row || this.isLocked(role)) return;

    row.canView = checked;

    // No view access means no edit access either
    if (!checked) {
      row.canEdit = false;
    }

    this.hasChanges = true;
  }

  toggleEdit(role: string, screen: string, checked: boolean): void {

    const row = this.find(role, screen);
    if (!row || this.isLocked(role)) return;

    row.canEdit = checked;

    // Edit access needs view access
    if (checked) {
      row.canView = true;
    }

    this.hasChanges = true;
  }

  save(): void {

    this.saving = true;

    this.roleAccessService.save(this.permissions).subscribe({
      next: (data) => {
        this.permissions = data;
        this.hasChanges = false;
        this.saving = false;

        // Refresh the logged-in Admin's own menu too
        this.authService.loadPermissions().subscribe({ error: () => {} });

        alert('Role access saved successfully');
      },
      error: (error) => {
        console.error('Save error:', error);
        this.saving = false;
        alert(error.error?.message || 'Failed to save role access');
      }
    });
  }
}
