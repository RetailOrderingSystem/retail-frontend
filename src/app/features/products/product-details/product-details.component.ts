// src/app/features/products/product-details/product-details.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService, ProductDto } from '../services/product.service';
import { CartService } from '../../orders/services/cart.service';
import { AuthService } from '../../auth/services/auth.service';

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
  loadingCart = false;
  isLoggedIn = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Check initial login state
    this.isLoggedIn = this.authService.isLoggedIn();
    
    // Subscribe to auth state changes
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = this.authService.isLoggedIn();
    });

    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getProductById(id).subscribe({
      next: p => { this.product = p; this.loading = false; },
      error: () => { this.error = 'Product not found'; this.loading = false; }
    });
  }

  increment() { if (this.quantity < 10) this.quantity++; }
  decrement() { if (this.quantity > 1) this.quantity--; }

  addToCart() {
    if (!this.product) return;

    if (!this.isLoggedIn) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: `/products/${this.product.productId}` }
      });
      return;
    }

    this.loadingCart = true;
    this.cartService.addToCart(this.product.productId, this.quantity).subscribe({
      next: () => {
        this.loadingCart = false;
        // Navigate to cart immediately
        this.router.navigate(['/cart']);
      },
      error: (err) => {
        this.loadingCart = false;
        console.error('Add to cart error:', err);
        this.error = 'Unable to add product to cart. Please try again.';
      }
    });
  }

  buyNow() {
    if (!this.product) return;

    if (!this.isLoggedIn) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: `/products/${this.product.productId}` }
      });
      return;
    }

    this.loadingCart = true;
    this.cartService.addToCart(this.product.productId, this.quantity).subscribe({
      next: () => {
        this.loadingCart = false;
        // Navigate to checkout immediately
        this.router.navigate(['/checkout']);
      },
      error: (err) => {
        this.loadingCart = false;
        console.error('Buy now error:', err);
        this.error = 'Unable to place order. Please try again.';
      }
    });
  }

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
