import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';

export interface Product {
  productId: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  categoryName?: string;
  stock?: number;
}

@Component({
  selector: 'app-manage-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manage-products.component.html',
  styleUrls: ['./manage-products.component.css']
})
export class ManageProductsComponent implements OnInit {
  products: Product[] = [];
  loading = true;
  actionMessage = '';
  errorMessage = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.api.get<Product[]>('product').subscribe({
      next: res => {
        if (res.success) this.products = res.data!;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load products.';
        this.loading = false;
      }
    });
  }

  toggleAvailability(product: Product): void {
    const updated = { isAvailable: !product.isAvailable };
    this.api.put(`product/${product.productId}`, updated).subscribe({
      next: res => {
        if (res.success) {
          product.isAvailable = !product.isAvailable;
          this.actionMessage = `Product "${product.name}" availability updated.`;
          setTimeout(() => this.actionMessage = '', 3000);
        }
      },
      error: () => this.errorMessage = 'Failed to update product.'
    });
  }

  deleteProduct(productId: number, name: string): void {
    if (!confirm(`Delete product "${name}"? This cannot be undone.`)) return;

    this.api.delete(`product/${productId}`).subscribe({
      next: res => {
        if (res.success) {
          this.products = this.products.filter(p => p.productId !== productId);
          this.actionMessage = `Product "${name}" deleted.`;
          setTimeout(() => this.actionMessage = '', 3000);
        }
      },
      error: () => this.errorMessage = 'Failed to delete product.'
    });
  }
}
