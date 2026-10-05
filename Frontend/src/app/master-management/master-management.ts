import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MasterService, MasterType } from '../services/master';
import { AuthService } from '../services/auth';

interface MasterTab {
  key: MasterType;
  label: string;
}

@Component({
  selector: 'app-master-management',
  imports: [FormsModule],
  templateUrl: './master-management.html',
  styleUrl: './master-management.css'
})
export class MasterManagement implements OnInit {

  tabs: MasterTab[] = [
    { key: 'DEPARTMENT', label: 'Department Master' },
    { key: 'DESIGNATION', label: 'Designation Master' },
    { key: 'ROLE', label: 'Role Master' },
    { key: 'PRODUCT_STATUS', label: 'Product Status Master' },
    { key: 'EMPLOYEE_STATUS', label: 'Employee Status Master' }
  ];

  activeTab: MasterType = 'DEPARTMENT';

  values: any[] = [];

  newValue: string = '';
  newDescription: string = '';

  editingId: number | null = null;
  editValue: string = '';
  editDescription: string = '';

  loading: boolean = false;

  // Employees can view master data but cannot add, edit or delete values
  isAdmin = false;

  constructor(
    private masterService: MasterService,
    private authService: AuthService
  ) {
    // true when this role has "Edit" on this screen (set in Role Access)
    this.isAdmin = this.authService.canEdit('MASTER_DATA');
  }

  ngOnInit(): void {
    this.loadValues();
  }

  selectTab(tab: MasterTab): void {
    this.activeTab = tab.key;
    this.cancelEdit();
    this.newValue = '';
    this.newDescription = '';
    this.loadValues();
  }

  currentTabLabel(): string {
    const found = this.tabs.find(t => t.key === this.activeTab);
    return found ? found.label : '';
  }

  loadValues(): void {
    this.loading = true;

    this.masterService.getByType(this.activeTab).subscribe({
      next: (data) => {
        this.values = data || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading master values:', error);
        this.loading = false;
        alert('Failed to load ' + this.currentTabLabel() + ' values');
      }
    });
  }

  addValue(): void {
    if (!this.newValue || !this.newValue.trim()) {
      alert('Please enter a value');
      return;
    }

    this.masterService.create(this.activeTab, this.newValue.trim(), this.newDescription.trim()).subscribe({
      next: () => {
        this.newValue = '';
        this.newDescription = '';
        this.loadValues();
      },
      error: (error) => {
        console.error('Error adding master value:', error);
        alert(error.error?.message || error.error || 'Failed to add value');
      }
    });
  }

  startEdit(row: any): void {
    this.editingId = row.id;
    this.editValue = row.value;
    this.editDescription = row.description || '';
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editValue = '';
    this.editDescription = '';
  }

  saveEdit(row: any): void {
    if (!this.editValue || !this.editValue.trim()) {
      alert('Value cannot be empty');
      return;
    }

    this.masterService.update(
      this.activeTab,
      row.id,
      this.editValue.trim(),
      this.editDescription.trim(),
      row.active
    ).subscribe({
      next: () => {
        this.cancelEdit();
        this.loadValues();
      },
      error: (error) => {
        console.error('Error updating master value:', error);
        alert(error.error?.message || error.error || 'Failed to update value');
      }
    });
  }

  deleteValue(row: any): void {
    const confirmDelete = confirm(`Delete "${row.value}" from ${this.currentTabLabel()}?`);

    if (!confirmDelete) {
      return;
    }

    this.masterService.delete(this.activeTab, row.id).subscribe({
      next: () => {
        this.loadValues();
      },
      error: (error) => {
        console.error('Error deleting master value:', error);
        alert(error.error?.message || error.error || 'Failed to delete value');
      }
    });
  }
}
