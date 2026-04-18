// src/app/features/products/product-list/product-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService, ProductDto, PagedProductDto, ProductFilter } from '../services/product.service';
import { FiltersComponent } from '../filters/filters.component';

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

  constructor(private productService: ProductService) {}

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

  get pages(): number[] {
    if (!this.pagedData) return [];
    return Array.from({ length: this.pagedData.totalPages }, (_, i) => i + 1);
  }

  getImageUrl(url?: string): string {
    return url || 'assets/images/placeholder-food.jpg';
  }
}
