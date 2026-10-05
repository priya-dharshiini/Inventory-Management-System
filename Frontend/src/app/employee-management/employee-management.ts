import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { EmployeeService } from '../services/employee';
import { MasterService } from '../services/master';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-employee-management',
  imports: [FormsModule],
  templateUrl: './employee-management.html',
  styleUrl: './employee-management.css'
})
export class EmployeeManagement implements OnInit {

  employees: any[] = [];

  departmentOptions: any[] = [];
  designationOptions: any[] = [];
  statusOptions: any[] = [];

  searchFields: any = {
    id: '', employeeName: '', email: '', phone: '', department: '', designation: '', status: ''
  };

  private searchDebounce: any = null;

  isAddingNew = false;
  newRow: any = this.emptyEmployee();
  newRowErrors: any = {};

  editingId: number | null = null;
  editRow: any = {};
  editRowErrors: any = {};

  private requiredFields = ['employeeName', 'email', 'phone', 'department', 'designation', 'status'];

  private emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private phonePattern = /^[0-9]{10}$/;

  private fieldLabels: any = {
    employeeName: 'Employee Name',
    email: 'Email',
    phone: 'Phone',
    department: 'Department',
    designation: 'Designation',
    status: 'Status'
  };

  // Employees can view this page but cannot create, edit or delete
  isAdmin = false;

  constructor(
    private employeeService: EmployeeService,
    private masterService: MasterService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {
    // true when this role has "Edit" on this screen (set in Role Access)
    this.isAdmin = this.authService.canEdit('EMPLOYEES');
  }

  ngOnInit(): void {
    this.getEmployees();
    this.loadMasterOptions();
  }

  emptyEmployee(): any {
    return { employeeName: '', email: '', phone: '', department: '', designation: '', status: 'ACTIVE' };
  }

  loadMasterOptions(): void {

    this.masterService.getByType('DEPARTMENT').subscribe({
      next: (data) => this.departmentOptions = data || [],
      error: (error) => console.error('Error loading department master:', error)
    });

    this.masterService.getByType('DESIGNATION').subscribe({
      next: (data) => this.designationOptions = data || [],
      error: (error) => console.error('Error loading designation master:', error)
    });

    this.masterService.getByType('EMPLOYEE_STATUS').subscribe({
      next: (data) => this.statusOptions = data || [],
      error: (error) => console.error('Error loading status master:', error)
    });
  }

  getEmployees(): void {

    this.employeeService.getAllEmployees().subscribe({
      next: (data) => {
        this.employees = [...data];
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        alert('Failed to load employees');
      }
    });
  }

  onSearchInput(): void {

    if (this.searchDebounce) {
      clearTimeout(this.searchDebounce);
    }

    this.searchDebounce = setTimeout(() => this.runSearch(), 300);
  }

  runSearch(): void {

    const hasCriteria = Object.values(this.searchFields)
      .some((value: any) => value !== null && value !== undefined && String(value).trim() !== '');

    if (!hasCriteria) {
      this.getEmployees();
      return;
    }

    this.employeeService.searchEmployees(this.searchFields).subscribe({
      next: (data) => {
        this.employees = [...data];
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Search error:', error);
        this.employees = [];
        this.cdr.detectChanges();
      }
    });
  }

  clearSearch(): void {
    this.searchFields = {
      id: '', employeeName: '', email: '', phone: '', department: '', designation: '', status: ''
    };
    this.getEmployees();
  }

  private validateRow(row: any): any {

    const errors: any = {};

    for (const field of this.requiredFields) {

      const value = row ? row[field] : null;
      const isEmpty = value === null || value === undefined || String(value).trim() === '';

      errors[field] = isEmpty ? `${this.fieldLabels[field]} is required` : '';
    }

    if (!errors['email'] && !this.emailPattern.test(String(row.email).trim())) {
      errors['email'] = 'Enter a valid email address';
    }

    if (!errors['phone'] && !this.phonePattern.test(String(row.phone).trim())) {
      errors['phone'] = 'Phone must be exactly 10 digits';
    }

    return errors;
  }

  private hasErrors(errors: any): boolean {
    return Object.values(errors).some((message) => !!message);
  }

  onNewRowChange(): void {
    this.newRowErrors = this.validateRow(this.newRow);
  }

  onEditRowChange(): void {
    this.editRowErrors = this.validateRow(this.editRow);
  }

  isNewRowValid(): boolean {
    return !this.hasErrors(this.validateRow(this.newRow));
  }

  isEditRowValid(): boolean {
    return !this.hasErrors(this.validateRow(this.editRow));
  }

  addEmployee(): void {
    this.isAddingNew = true;
    this.newRow = this.emptyEmployee();
    this.newRowErrors = this.validateRow(this.newRow);
  }

  saveNewEmployee(): void {

    this.newRowErrors = this.validateRow(this.newRow);

    if (this.hasErrors(this.newRowErrors)) {
      return;
    }

    this.employeeService.createEmployee(this.newRow).subscribe({
      next: () => {
        alert('Employee added successfully');
        this.isAddingNew = false;
        this.newRow = this.emptyEmployee();
        this.newRowErrors = {};
        this.getEmployees();
      },
      error: (error) => {
        console.error('Create error:', error);
        alert(error.error?.message || error.error || 'Failed to add employee');
      }
    });
  }

  cancelAddEmployee(): void {
    this.isAddingNew = false;
    this.newRow = this.emptyEmployee();
    this.newRowErrors = {};
  }

  editEmployee(employee: any): void {

    if (this.isAddingNew || (this.editingId !== null && this.editingId !== employee.id)) {
      return;
    }

    this.editingId = employee.id;
    this.editRow = { ...employee };
    this.editRowErrors = this.validateRow(this.editRow);
  }

  saveEditEmployee(id: number): void {

    this.editRowErrors = this.validateRow(this.editRow);

    if (this.hasErrors(this.editRowErrors)) {
      return;
    }

    this.employeeService.updateEmployee(id, this.editRow).subscribe({
      next: () => {
        alert('Employee updated successfully');
        this.editingId = null;
        this.editRowErrors = {};
        this.getEmployees();
      },
      error: (error) => {
        console.error('Update error:', error);
        alert(error.error?.message || error.error || 'Failed to update employee');
      }
    });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editRow = {};
    this.editRowErrors = {};
  }

  deleteEmployee(id: number): void {

    if (!confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    this.employeeService.deleteEmployee(id).subscribe({
      next: () => {
        alert('Employee deleted successfully');
        this.getEmployees();
      },
      error: (error) => {
        console.error('Delete error:', error);
        alert('Failed to delete employee');
      }
    });
  }
}
