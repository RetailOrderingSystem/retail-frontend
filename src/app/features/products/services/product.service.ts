// src/app/features/products/services/product.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ProductDto {
  productId: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  isActive: boolean;
  categoryId: number;
  categoryName: string;
  stockQuantity: number;
  isLowStock: boolean;
  createdAt: string;
}

export interface CategoryDto {
  categoryId: number;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  productCount: number;
}

export interface PagedProductDto {
  products: ProductDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProductFilter {
  categoryId?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isAvailable?: boolean;
  page?: number;
  pageSize?: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private base = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  getProducts(filter: ProductFilter = {}): Observable<PagedProductDto> {
    let params = new HttpParams();
    if (filter.categoryId) params = params.set('categoryId', filter.categoryId);
    if (filter.search) params = params.set('search', filter.search);
    if (filter.minPrice != null) params = params.set('minPrice', filter.minPrice);
    if (filter.maxPrice != null) params = params.set('maxPrice', filter.maxPrice);
    if (filter.isAvailable != null) params = params.set('isAvailable', filter.isAvailable);
    params = params.set('page', filter.page ?? 1);
    params = params.set('pageSize', filter.pageSize ?? 12);
    return this.http.get<PagedProductDto>(`${this.base}/product`, { params });
  }

  getProductById(id: number): Observable<ProductDto> {
    return this.http.get<ProductDto>(`${this.base}/product/${id}`);
  }

  getCategories(): Observable<CategoryDto[]> {
    return this.http.get<CategoryDto[]>(`${this.base}/category`);
  }
}
 
