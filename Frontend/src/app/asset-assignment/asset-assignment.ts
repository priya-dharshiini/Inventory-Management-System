import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { EmployeeService } from '../services/employee';
import { ProductService } from '../services/product';
import { AssetAssignmentService } from '../services/assetassignment';
import { MasterService } from '../services/master';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-asset-assignment',
  imports: [ReactiveFormsModule],
  templateUrl: './asset-assignment.html',
  styleUrl: './asset-assignment.css'
})
export class AssetAssignment implements OnInit {

  assignmentForm;

  employees: any[] = [];
  products: any[] = [];

  departmentOptions: any[] = [];
  designationOptions: any[] = [];
  roleOptions: any[] = [];
  productStatusOptions: any[] = [];
  employeeStatusOptions: any[] = [];

  // Employees can view this page but cannot assign assets
  isAdmin = false;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private productService: ProductService,
    private assetAssignmentService: AssetAssignmentService,
    private masterService: MasterService,
    private authService: AuthService
  ) {
    // true when this role has "Edit" on this screen (set in Role Access)
    this.isAdmin = this.authService.canEdit('ASSET_ASSIGNMENT');

    this.assignmentForm = this.fb.group({
      employeeId: ['', Validators.required],
      productId: ['', Validators.required],
      assignmentType: ['PERMANENT', Validators.required],
      department: [''],
      designation: [''],
      role: [''],
      productStatus: [''],
      employeeStatus: [''],
      fromDate: ['', Validators.required],
      toDate: [''],
      remarks: ['']
    });
  }

  ngOnInit(): void {
    this.loadEmployees();
    this.loadProducts();
    this.loadMasterOptions();
  }

  loadMasterOptions(): void {

    this.masterService.getByType('DEPARTMENT').subscribe({
      next: (data) => this.departmentOptions = data || [],
      error: (error) => console.error('Error loading departments:', error)
    });

    this.masterService.getByType('DESIGNATION').subscribe({
      next: (data) => this.designationOptions = data || [],
      error: (error) => console.error('Error loading designations:', error)
    });

    this.masterService.getByType('ROLE').subscribe({
      next: (data) => this.roleOptions = data || [],
      error: (error) => console.error('Error loading roles:', error)
    });

    this.masterService.getByType('PRODUCT_STATUS').subscribe({
      next: (data) => this.productStatusOptions = data || [],
      error: (error) => console.error('Error loading product statuses:', error)
    });

    this.masterService.getByType('EMPLOYEE_STATUS').subscribe({
      next: (data) => this.employeeStatusOptions = data || [],
      error: (error) => console.error('Error loading employee statuses:', error)
    });
  }

  loadEmployees(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: (data) => this.employees = data,
      error: (error) => console.error('Error loading employees:', error)
    });
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (data) => this.products = data,
      error: (error) => console.error('Error loading products:', error)
    });
  }

  onEmployeeChange(): void {

    const employeeId = this.assignmentForm.value.employeeId;
    const selected = this.employees.find((e) => String(e.id) === String(employeeId));

    if (selected) {
      this.assignmentForm.patchValue({
        department: selected.department || '',
        designation: selected.designation || ''
      });
    }
  }

  // True if "value" is already one of the master-data options.
  // Used so the dropdown can show the employee's current value even
  // if it was never added to the master list.
  isKnownOption(value: string, options: any[]): boolean {
    return options.some((opt) => opt.value === value);
  }

  onAssignmentTypeChange(): void {

    const toDate = this.assignmentForm.get('toDate');

    if (this.assignmentForm.value.assignmentType === 'TEMPORARY') {
      toDate?.setValidators([Validators.required]);
    } else {
      toDate?.clearValidators();
      toDate?.reset();
    }

    toDate?.updateValueAndValidity();
  }

  submitAssignment(): void {

    if (this.assignmentForm.invalid) {
      this.assignmentForm.markAllAsTouched();
      return;
    }

    const form = this.assignmentForm.value;

    this.assetAssignmentService.createAssignment(
      Number(form.employeeId),
      Number(form.productId),
      form.assignmentType!,
      form.fromDate!,
      form.toDate || '',
      form.remarks || '',
      form.department || '',
      form.designation || '',
      form.role || '',
      form.productStatus || '',
      form.employeeStatus || ''
    ).subscribe({
      next: () => {
        alert('Asset assigned successfully!');
        this.resetForm();

        this.loadProducts();
      },
      error: (error) => {
        console.error('Assignment error:', error);
        alert(error.error?.message || error.error || 'Failed to assign asset');
      }
    });
  }

  cancelAssignment(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.assignmentForm.reset({
      employeeId: '',
      productId: '',
      assignmentType: 'PERMANENT',
      department: '',
      designation: '',
      role: '',
      productStatus: '',
      employeeStatus: '',
      fromDate: '',
      toDate: '',
      remarks: ''
    });
  }
}
