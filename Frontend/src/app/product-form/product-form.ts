import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ProductService } from '../services/product';

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css'
})
export class ProductForm implements OnInit {

  productForm!: FormGroup;
  productId: number | null = null;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.productForm = this.fb.group({
      productName: ['', Validators.required],
      productType: ['', Validators.required],
      brand: ['', Validators.required],
      model: ['', Validators.required],
      serialNumber: ['', Validators.required],
      purchaseDate: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      status: ['AVAILABLE', Validators.required]
    });

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode = true;
      this.productId = Number(id);
      this.loadProduct(this.productId);
    }
  }

  loadProduct(id: number): void {

    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.productForm.patchValue({
          productName: product.productName,
          productType: product.productType,
          brand: product.brand,
          model: product.model,
          serialNumber: product.serialNumber,
          purchaseDate: product.purchaseDate,
          price: product.price,
          status: product.status
        });
      },
      error: (error) => {
        console.error('Error loading product:', error);
        alert('Failed to load product');
      }
    });
  }

  submitProduct(): void {

    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const productData = this.productForm.value;

    if (this.isEditMode && this.productId !== null) {
      this.updateProduct(productData);
    } else {
      this.createProduct(productData);
    }
  }

  private createProduct(productData: any): void {

    this.productService.createProduct(productData).subscribe({
      next: () => {
        alert('Product added successfully');
        this.router.navigate(['/products']);
      },
      error: (error) => {
        console.error('Create product error:', error);
        alert('Failed to add product');
      }
    });
  }

  private updateProduct(productData: any): void {

    this.productService.updateProduct(this.productId!, productData).subscribe({
      next: () => {
        alert('Product updated successfully');
        this.router.navigate(['/products']);
      },
      error: (error) => {
        console.error('Update error:', error);
        alert('Failed to update product');
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/products']);
  }
}
