import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router } from "@angular/router";
import { CartService, CartResponse } from "../services/cart.service";

@Component({
  selector: "app-cart",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./cart.component.html",
  styleUrls: ["./cart.component.css"]
})
export class CartComponent implements OnInit {
  cart: CartResponse | null = null;
  loading = true;
  updatingId: number | null = null;

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit(): void {
    console.log('Cart Component: Loading cart...');
    this.cartService.getCart().subscribe({
      next: res => { 
        this.cart = res.data ?? null; 
        this.loading = false;
        console.log('Cart loaded:', this.cart);
      },
      error: (err) => {
        console.error('Cart load error:', err);
        this.loading = false;
      }
    });
  }

  updateQuantity(cartItemId: number, qty: number): void {
    if (qty < 1) { this.removeItem(cartItemId); return; }
    this.updatingId = cartItemId;
    this.cartService.updateItem(cartItemId, qty).subscribe({
      next: res => { 
        this.cart = res.data ?? null; 
        this.updatingId = null; 
      },
      error: (err) => {
        console.error('Update error:', err);
        this.updatingId = null;
      }
    });
  }

  removeItem(cartItemId: number): void {
    this.updatingId = cartItemId;
    this.cartService.removeItem(cartItemId).subscribe({
      next: res => { 
        this.cart = res.data ?? null; 
        this.updatingId = null; 
      },
      error: (err) => {
        console.error('Remove error:', err);
        this.updatingId = null;
      }
    });
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe(() => {
      this.cart = null;
      console.log('Cart cleared');
    });
  }

  checkout(): void {
    this.router.navigate(["/checkout"]);
  }
}
