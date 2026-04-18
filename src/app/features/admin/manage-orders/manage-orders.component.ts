import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminOrder } from '../services/admin.service';

@Component({
  selector: 'app-manage-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-orders.component.html',
  styleUrls: ['./manage-orders.component.css']
})
export class ManageOrdersComponent implements OnInit {
  orders: AdminOrder[] = [];
  selectedOrder: AdminOrder | null = null;
  loading = true;
  actionMessage = '';
  errorMessage = '';

  readonly orderStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.adminService.getAllOrders().subscribe({
      next: res => {
        if (res.success) this.orders = res.data!;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load orders.';
        this.loading = false;
      }
    });
  }

  viewOrder(order: AdminOrder): void {
    this.selectedOrder = order;
  }

  closeModal(): void {
    this.selectedOrder = null;
  }

  updateStatus(order: AdminOrder, newStatus: string): void {
    if (!newStatus || newStatus === order.status) return;

    this.adminService.updateOrderStatus(order.orderId, newStatus).subscribe({
      next: res => {
        if (res.success) {
          order.status = newStatus;
          this.actionMessage = `Order #${order.orderId} updated to "${newStatus}".`;
          setTimeout(() => this.actionMessage = '', 3000);
        }
      },
      error: () => this.errorMessage = 'Failed to update order status.'
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Pending: 'badge-pending',
      Processing: 'badge-processing',
      Shipped: 'badge-shipped',
      Delivered: 'badge-delivered',
      Cancelled: 'badge-cancelled'
    };
    return map[status] ?? 'badge-pending';
  }
}
