import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface ProductCardData {
  productId: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryName?: string;
  isAvailable: boolean;
}

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css']
})
export class ProductCardComponent {
  @Input() product!: ProductCardData;
  @Output() addToCart = new EventEmitter<ProductCardData>();

  onAddToCart(): void {
    if (this.product.isAvailable) {
      this.addToCart.emit(this.product);
    }
  }

  getImageUrl(): string {
    return this.product.imageUrl || 'assets/images/placeholder-food.png';
  }
}