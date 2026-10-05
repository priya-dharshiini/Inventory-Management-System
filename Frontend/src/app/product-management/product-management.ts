import { Router } from '@angular/router';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ProductService } from '../services/product';
import { MasterService } from '../services/master';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-product-management',
  imports: [FormsModule],
  templateUrl: './product-management.html',
  styleUrl: './product-management.css'
})
export class ProductManagement implements OnInit {

  products: any[] = [];
  statusOptions: any[] = [];

  searchFields: any = {
    id: '', productName: '', productType: '', brand: '',
    model: '', serialNumber: '', status: '', purchaseDate: '', price: ''
  };

  private searchDebounce: any = null;

  isAddingNew = false;
  newRow: any = this.emptyProduct();
  newRowErrors: any = {};

  editingId: number | null = null;
  editRow: any = {};
  editRowErrors: any = {};

  private requiredFields = [
    'productName', 'productType', 'brand', 'model',
    'serialNumber', 'purchaseDate', 'price', 'status'
  ];

  private fieldLabels: any = {
    productName: 'Product Name',
    productType: 'Product Type',
    brand: 'Brand',
    model: 'Model',
    serialNumber: 'Serial Number',
    purchaseDate: 'Purchase Date',
    price: 'Price',
    status: 'Status'
  };

  // Employees can view this page but cannot create, edit or delete
  isAdmin = false;

  constructor(
    private productService: ProductService,
    private masterService: MasterService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {
    // true when this role has "Edit" on this screen (set in Role Access)
    this.isAdmin = this.authService.canEdit('PRODUCTS');
  }

  ngOnInit(): void {
    this.getProducts();
    this.loadStatusOptions();
  }

  emptyProduct(): any {
    return {
      productName: '', productType: '', brand: '', model: '',
      serialNumber: '', purchaseDate: '', price: null, status: 'AVAILABLE'
    };
  }

  loadStatusOptions(): void {

    this.masterService.getByType('PRODUCT_STATUS').subscribe({
      next: (data) => this.statusOptions = data || [],
      error: (error) => console.error('Error loading status master:', error)
    });
  }

  getProducts(): void {

    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = [...data];
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading products:', error);
        alert('Failed to load products');
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
      this.getProducts();
      return;
    }

    this.productService.searchProducts(this.searchFields).subscribe({
      next: (data) => {
        this.products = [...data];
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Search error:', error);
        this.products = [];
        this.cdr.detectChanges();
      }
    });
  }

  clearSearch(): void {
    this.searchFields = {
      id: '', productName: '', productType: '', brand: '',
      model: '', serialNumber: '', status: '', purchaseDate: '', price: ''
    };
    this.getProducts();
  }

  private validateRow(row: any): any {

    const errors: any = {};

    for (const field of this.requiredFields) {

      const value = row ? row[field] : null;
      const isEmpty = value === null || value === undefined || String(value).trim() === '';

      errors[field] = isEmpty ? `${this.fieldLabels[field]} is required` : '';
    }

    if (!errors['price'] && Number(row.price) <= 0) {
      errors['price'] = 'Price must be greater than 0';
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

  addProduct(): void {
    this.isAddingNew = true;
    this.newRow = this.emptyProduct();
    this.newRowErrors = this.validateRow(this.newRow);
  }

  saveNewProduct(): void {

    this.newRowErrors = this.validateRow(this.newRow);

    if (this.hasErrors(this.newRowErrors)) {
      return;
    }

    this.productService.createProduct(this.newRow).subscribe({
      next: () => {
        alert('Product added successfully');
        this.isAddingNew = false;
        this.newRow = this.emptyProduct();
        this.newRowErrors = {};
        this.getProducts();
      },
      error: (error) => {
        console.error('Create error:', error);
        alert(error.error?.message || error.error || 'Failed to add product');
      }
    });
  }

  cancelAddProduct(): void {
    this.isAddingNew = false;
    this.newRow = this.emptyProduct();
    this.newRowErrors = {};
  }

  editProduct(product: any): void {

    if (this.isAddingNew || (this.editingId !== null && this.editingId !== product.id)) {
      return;
    }

    this.editingId = product.id;
    this.editRow = { ...product };
    this.editRowErrors = this.validateRow(this.editRow);
  }

  saveEditProduct(id: number): void {

    this.editRowErrors = this.validateRow(this.editRow);

    if (this.hasErrors(this.editRowErrors)) {
      return;
    }

    this.productService.updateProduct(id, this.editRow).subscribe({
      next: () => {
        alert('Product updated successfully');
        this.editingId = null;
        this.editRowErrors = {};
        this.getProducts();
      },
      error: (error) => {
        console.error('Update error:', error);
        alert(error.error?.message || error.error || 'Failed to update product');
      }
    });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editRow = {};
    this.editRowErrors = {};
  }

  deleteProduct(id: number): void {

    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    this.productService.deleteProduct(id).subscribe({
      next: () => {
        alert('Product deleted successfully');
        this.getProducts();
      },
      error: (error) => {
        console.error('Delete error:', error);
        alert('Failed to delete product');
      }
    });
  }
}
