import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AssetAssignmentService } from '../services/assetassignment';
import { AuthService } from '../services/auth';
import { hasSearchCriteria, SearchDebouncer } from '../shared/form-utils';

@Component({
  selector: 'app-assignment-register',
  imports: [FormsModule],
  templateUrl: './assignment-register.html',
  styleUrl: './assignment-register.css'
})
export class AssignmentRegister implements OnInit {

  assignments: any[] = [];

  searchFields: any = {
    id: '', employeeName: '', department: '', productName: '', model: '',
    serialNumber: '', assignmentType: '', fromDate: '', toDate: '', status: ''
  };

  // Employees can view the register but cannot return assets
  isAdmin = false;

  private searchDebouncer = new SearchDebouncer();

  constructor(
    private assetAssignmentService: AssetAssignmentService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {
    // true when this role has "Edit" on this screen (set in Role Access)
    this.isAdmin = this.authService.canEdit('ASSIGNMENT_REGISTER');
  }

  ngOnInit(): void {
    this.getAssignments();
  }

  getAssignments(): void {
    this.assetAssignmentService.getAllAssignments().subscribe({
      next: (data) => {
        this.assignments = [...data];
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading assignments:', error);
        alert('Failed to load assignments');
      }
    });
  }

  onSearchInput(): void {
    this.searchDebouncer.run(() => this.runSearch());
  }

  runSearch(): void {
    if (!hasSearchCriteria(this.searchFields)) {
      this.getAssignments();
      return;
    }

    this.assetAssignmentService.searchAssignments(this.searchFields).subscribe({
      next: (data) => {
        this.assignments = [...data];
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Search error:', error);
        this.assignments = [];
        this.cdr.detectChanges();
      }
    });
  }

  returnAsset(id: number): void {
    const condition = prompt('Enter asset condition (GOOD / DAMAGED):');
    if (!condition) {
      return;
    }

    const remarks = prompt('Enter return remarks:') || '';

    this.assetAssignmentService.returnAsset(id, condition, remarks).subscribe({
      next: () => {
        alert('Asset returned successfully!');
        this.getAssignments();
      },
      error: (error) => {
        console.error('Return asset error:', error);
        alert(error.error?.message || error.error || 'Failed to return asset');
      }
    });
  }
}
