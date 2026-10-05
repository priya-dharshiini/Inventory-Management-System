import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { EmployeeService } from '../services/employee';

@Component({
  selector: 'app-employee-form',
  imports: [ReactiveFormsModule],
  templateUrl: './employee-form.html',
  styleUrl: './employee-form.css'
})
export class EmployeeForm implements OnInit {

  employeeForm!: FormGroup;
  employeeId: number | null = null;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.employeeForm = this.fb.group({
      employeeName: ['', Validators.required],
      employeeCode: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      department: ['', Validators.required],
      designation: ['', Validators.required],
      joiningDate: ['', Validators.required],
      status: ['ACTIVE', Validators.required]
    });

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode = true;
      this.employeeId = Number(id);
      this.loadEmployee(this.employeeId);
    }
  }

  loadEmployee(id: number): void {

    this.employeeService.getEmployeeById(id).subscribe({
      next: (employee) => {
        this.employeeForm.patchValue({
          employeeName: employee.employeeName,
          employeeCode: employee.employeeCode,
          email: employee.email,
          phone: employee.phone,
          department: employee.department,
          designation: employee.designation,
          joiningDate: employee.joiningDate,
          status: employee.status
        });
      },
      error: (error) => {
        console.error('Error loading employee:', error);
        alert('Failed to load employee');
      }
    });
  }

  submitEmployee(): void {

    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    const employeeData = this.employeeForm.value;

    if (this.isEditMode && this.employeeId !== null) {
      this.updateEmployee(employeeData);
    } else {
      this.createEmployee(employeeData);
    }
  }

  private createEmployee(employeeData: any): void {

    this.employeeService.createEmployee(employeeData).subscribe({
      next: () => {
        alert('Employee added successfully');
        this.router.navigate(['/employees']);
      },
      error: (error) => {
        console.error('Add employee error:', error);
        alert('Failed to add employee');
      }
    });
  }

  private updateEmployee(employeeData: any): void {

    this.employeeService.updateEmployee(this.employeeId!, employeeData).subscribe({
      next: () => {
        alert('Employee updated successfully');
        this.router.navigate(['/employees']);
      },
      error: (error) => {
        console.error('Update employee error:', error);
        alert('Failed to update employee');
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/employees']);
  }
}
