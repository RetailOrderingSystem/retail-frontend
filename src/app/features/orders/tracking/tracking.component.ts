import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, ActivatedRoute } from "@angular/router";
import { OrderService, Order } from "../services/order.service";

@Component({
  selector: "app-tracking",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./tracking.component.html",
  styleUrls: ["./tracking.component.css"]
})
export class TrackingComponent implements OnInit {
  order: Order | null = null;
  loading = true;

  readonly statusSteps = [
    { key: "Pending",       label: "Order Placed",   icon: "&#128230;" },
    { key: "Confirmed",     label: "Confirmed",      icon: "&#10003;" },
    { key: "Preparing",     label: "Preparing",      icon: "&#127859;" },
    { key: "OutForDelivery",label: "Out for Delivery","icon": "&#128690;" },
    { key: "Delivered",     label: "Delivered",      icon: "&#127881;" }
  ];

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get("id"));
    this.orderService.getOrder(id).subscribe({
      next: res => { this.order = res.data ?? null; this.loading = false; },
      error: () => this.loading = false
    });
  }

  getStepIndex(status: string): number {
    return this.statusSteps.findIndex(s => s.key === status);
  }

  isCompleted(index: number): boolean {
    return this.order ? index <= this.getStepIndex(this.order.status) : false;
  }
}
