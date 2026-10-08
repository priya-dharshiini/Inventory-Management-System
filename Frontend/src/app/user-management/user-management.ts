import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { UserService } from '../services/user';
import { AuthService } from '../services/auth';
import { buildRequiredErrors, hasErrors, isValidEmail } from '../shared/form-utils';

const FIELD_LABELS: Record<string, string> = {
  username: 'Username', name: 'Name', email: 'Email', role: 'Role'
};

@Component({
  selector: 'app-user-management',
  imports: [FormsModule],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css'
})
export class UserManagement implements OnInit {

  users: any[] = [];

  isAddingNew = false;
  newRow: any = this.emptyUser();
  newRowErrors: any = {};

  editingId: number | null = null;
  editRow: any = {};
  editRowErrors: any = {};

  // The currently logged-in user's own username, so they can't delete themselves
  currentUsername = '';

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {
    this.currentUsername = this.authService.getUsername();
  }

  ngOnInit(): void {
    this.getUsers();
  }

  emptyUser(): any {
    return { username: '', name: '', email: '', password: '', role: 'EMPLOYEE' };
  }

  getUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => this.users = data,
      error: (error) => {
        console.error('Error loading users:', error);
        alert('Failed to load users');
      }
    });
  }

  private validateRow(row: any, isCreate: boolean): any {
    const errors = buildRequiredErrors(row, ['username', 'name', 'email', 'role'], FIELD_LABELS);

    if (!errors.email && !isValidEmail(row.email)) {
      errors.email = 'Enter a valid email address';
    }

    errors.password = isCreate && (!row.password || !row.password.trim()) ? 'Password is required' : '';

    return errors;
  }

  onNewRowChange(): void {
    this.newRowErrors = this.validateRow(this.newRow, true);
  }

  onEditRowChange(): void {
    this.editRowErrors = this.validateRow(this.editRow, false);
  }

  isNewRowValid(): boolean {
    return !hasErrors(this.validateRow(this.newRow, true));
  }

  isEditRowValid(): boolean {
    return !hasErrors(this.validateRow(this.editRow, false));
  }

  addUser(): void {
    this.isAddingNew = true;
    this.newRow = this.emptyUser();
    this.newRowErrors = this.validateRow(this.newRow, true);
  }

  saveNewUser(): void {

    this.newRowErrors = this.validateRow(this.newRow, true);

    if (hasErrors(this.newRowErrors)) {
      return;
    }

    this.userService.createUser(this.newRow).subscribe({
      next: () => {
        alert('User created successfully');
        this.isAddingNew = false;
        this.newRow = this.emptyUser();
        this.newRowErrors = {};
        this.getUsers();
      },
      error: (error) => {
        console.error('Create error:', error);
        alert(error.error?.message || error.error || 'Failed to create user');
      }
    });
  }

  cancelAddUser(): void {
    this.isAddingNew = false;
    this.newRow = this.emptyUser();
    this.newRowErrors = {};
  }

  editUser(user: any): void {

    if (this.isAddingNew || (this.editingId !== null && this.editingId !== user.id)) {
      return;
    }

    this.editingId = user.id;
    this.editRow = { ...user, password: '' };
    this.editRowErrors = this.validateRow(this.editRow, false);
  }

  saveEditUser(id: number): void {

    this.editRowErrors = this.validateRow(this.editRow, false);

    if (hasErrors(this.editRowErrors)) {
      return;
    }

    this.userService.updateUser(id, this.editRow).subscribe({
      next: () => {
        alert('User updated successfully');
        this.editingId = null;
        this.getUsers();
      },
      error: (error) => {
        console.error('Update error:', error);
        alert(error.error?.message || error.error || 'Failed to update user');
      }
    });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editRow = {};
    this.editRowErrors = {};
  }

  deleteUser(id: number): void {

    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    this.userService.deleteUser(id).subscribe({
      next: () => {
        alert('User deleted successfully');
        this.getUsers();
      },
      error: (error) => {
        console.error('Delete error:', error);
        alert(error.error?.message || error.error || 'Failed to delete user');
      }
    });
  }
}
