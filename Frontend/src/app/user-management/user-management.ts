import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { UserService } from '../services/user';
import { AuthService } from '../services/auth';

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

private emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    const errors: any = {};

    errors.username = !row.username || !row.username.trim() ? 'Username is required' : '';
    errors.name = !row.name || !row.name.trim() ? 'Name is required' : '';
    errors.email = !row.email || !row.email.trim() ? 'Email is required' : '';
    errors.role = !row.role ? 'Role is required' : '';

    if (!errors.email && !this.emailPattern.test(String(row.email).trim())) {
      errors.email = 'Enter a valid email address';
    }

    if (isCreate && (!row.password || !row.password.trim())) {
      errors.password = 'Password is required';
    } else {
      errors.password = '';
    }

    return errors;
  }

  private hasErrors(errors: any): boolean {
    return Object.values(errors).some((message) => !!message);
  }

  onNewRowChange(): void {
    this.newRowErrors = this.validateRow(this.newRow, true);
  }

  onEditRowChange(): void {
    this.editRowErrors = this.validateRow(this.editRow, false);
  }

  isNewRowValid(): boolean {
    return !this.hasErrors(this.validateRow(this.newRow, true));
  }

  isEditRowValid(): boolean {
    return !this.hasErrors(this.validateRow(this.editRow, false));
  }

  addUser(): void {
    this.isAddingNew = true;
    this.newRow = this.emptyUser();
    this.newRowErrors = this.validateRow(this.newRow, true);
  }

  saveNewUser(): void {

    this.newRowErrors = this.validateRow(this.newRow, true);

    if (this.hasErrors(this.newRowErrors)) {
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

    if (this.hasErrors(this.editRowErrors)) {
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
