// src/app/features/products/product-details/product-details.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService, ProductDto } from '../services/product.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
  product: ProductDto | null = null;
  loading = true;
  error = '';
  quantity = 1;

  constructor(private route: ActivatedRoute, private productService: ProductService) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getProductById(id).subscribe({
      next: p => { this.product = p; this.loading = false; },
      error: () => { this.error = 'Product not found'; this.loading = false; }
    });
  }

  increment() { if (this.quantity < 10) this.quantity++; }
  decrement() { if (this.quantity > 1) this.quantity--; }

  getImageUrl(url?: string) {
    return url || 'assets/images/placeholder-food.jpg';
  }

  getStockLabel(): string {
    if (!this.product) return '';
    if (this.product.stockQuantity === 0) return 'Out of Stock';
    if (this.product.isLowStock) return `Only ${this.product.stockQuantity} left!`;
    return 'In Stock';
  }
}
