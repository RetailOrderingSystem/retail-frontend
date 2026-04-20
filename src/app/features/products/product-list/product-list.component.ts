// src/app/features/products/product-list/product-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ProductService, ProductDto, PagedProductDto, ProductFilter } from '../services/product.service';
import { FiltersComponent } from '../filters/filters.component';
import { CartService } from '../../orders/services/cart.service';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FiltersComponent],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  pagedData: PagedProductDto | null = null;
  currentFilter: ProductFilter = { page: 1, pageSize: 12 };
  loading = true;
  error = '';
  addingProductId: number | null = null;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() { this.loadProducts(); }

  loadProducts() {
    this.loading = true;
    this.productService.getProducts(this.currentFilter).subscribe({
      next: data => { this.pagedData = data; this.loading = false; },
      error: () => { this.error = 'Failed to load products'; this.loading = false; }
    });
  }

  onFilterChanged(filter: ProductFilter) {
    this.currentFilter = filter;
    this.loadProducts();
  }

  goToPage(page: number) {
    this.currentFilter.page = page;
    this.loadProducts();
    window.scrollTo(0, 0);
  }

  addToCart(product: ProductDto, event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();

  if (!this.authService.isLoggedIn()) {
    this.router.navigate(['/auth/login']);
    return;
  }

  this.addingProductId = product.productId;
  this.cartService.addToCart(product.productId).subscribe({
    next: () => {
      this.addingProductId = null;
      // show a success message instead of navigating
      alert('Item added to cart!'); // or use a toast notification
    },
    error: () => {
      this.error = 'Unable to add item to cart. Please try again.';
      this.addingProductId = null;
    }
  });
}

  get pages(): number[] {
    if (!this.pagedData) return [];
    return Array.from({ length: this.pagedData.totalPages }, (_, i) => i + 1);
  }

  getImageUrl(url?: string): string {
    return url || 'assets/images/placeholder-food.jpg';
  }
}
