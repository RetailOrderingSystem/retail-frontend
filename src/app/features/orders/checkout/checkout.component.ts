import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { OrderService } from "../services/order.service";
import { CartService, CartResponse } from "../services/cart.service";

@Component({
  selector: "app-checkout",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./checkout.component.html",
  styleUrls: ["./checkout.component.css"]
})
export class CheckoutComponent implements OnInit {
  cart: CartResponse | null = null;
  address = "";
  notes = "";
  paymentMethod = "COD";
  loading = false;
  cartLoading = true;
  error = "";

  constructor(
    private orderService: OrderService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('Checkout Component: Loading cart...');
    this.cartService.getCart().subscribe({
      next: res => { 
        this.cart = res.data ?? null; 
        this.cartLoading = false;
        console.log('Checkout cart loaded:', this.cart);
      },
      error: (err) => {
        console.error('Checkout cart error:', err);
        this.cartLoading = false;
      }
    });
  }

  placeOrder(): void {
    if (!this.address.trim()) { this.error = "Please enter delivery address."; return; }
    this.loading = true; 
    this.error = "";
    console.log('Placing order with address:', this.address);
    
    this.orderService.placeOrder({
      deliveryAddress: this.address,
      notes: this.notes,
      paymentMethod: this.paymentMethod
    }).subscribe({
      next: res => {
        console.log('Order placed successfully:', res);
        if (res.success && res.data) {
          this.router.navigate(["/orders/tracking", res.data.orderId]);
        }
      },
      error: err => { 
        console.error('Order placement error:', err);
        this.error = err?.error?.message || "Order failed."; 
        this.loading = false; 
      }
    });
  }
}
