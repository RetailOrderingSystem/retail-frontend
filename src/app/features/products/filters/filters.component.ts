// src/app/features/products/filters/filters.component.ts
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, CategoryDto, ProductFilter } from '../services/product.service';

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.css']
})
export class FiltersComponent implements OnInit {
  @Output() filterChanged = new EventEmitter<ProductFilter>();

  categories: CategoryDto[] = [];
  filter: ProductFilter = { page: 1, pageSize: 12 };
  minP = 0; maxP = 5000;

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.productService.getCategories().subscribe(c => this.categories = c);
  }

  apply() {
    this.filter.page = 1;
    if (this.minP > 0) this.filter.minPrice = this.minP;
    if (this.maxP < 5000) this.filter.maxPrice = this.maxP;
    this.filterChanged.emit({ ...this.filter });
  }

  reset() {
    this.filter = { page: 1, pageSize: 12 };
    this.minP = 0; this.maxP = 5000;
    this.filterChanged.emit({ ...this.filter });
  }
}
