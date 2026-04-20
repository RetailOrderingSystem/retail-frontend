import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { OrderService, Order } from "../services/order.service";

@Component({
  selector: "app-order-history",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./order-history.component.html",
  styleUrls: ["./order-history.component.css"]
})
export class OrderHistoryComponent implements OnInit {
  orders: Order[] = [];
  loading = true;
  reorderingId: number | null = null;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    console.log('Order History Component: Loading orders...');
    this.orderService.getOrderHistory().subscribe({
      next: res => { 
        this.orders = res.data ?? []; 
        this.loading = false;
        console.log('Orders loaded:', this.orders);
      },
      error: (err) => {
        console.error('Order history error:', err);
        this.loading = false;
      }
    });
  }

  reorder(orderId: number): void {
    this.reorderingId = orderId;
    this.orderService.reorder(orderId).subscribe({
      next: () => { 
        alert("Reorder placed!"); 
        this.reorderingId = null; 
      },
      error: (err) => { 
        console.error('Reorder error:', err);
        alert("Reorder failed."); 
        this.reorderingId = null; 
      }
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Pending: "status-pending", Confirmed: "status-confirmed",
      Preparing: "status-preparing", OutForDelivery: "status-delivery",
      Delivered: "status-delivered", Cancelled: "status-cancelled"
    };
    return map[status] ?? "";
  }
}
