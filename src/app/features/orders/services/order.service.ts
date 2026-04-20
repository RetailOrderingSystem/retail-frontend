import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiService } from "../../../core/services/api.service";
import { ApiResponse } from "../../../core/models/api-response.model";

export interface OrderItem {
  orderItemId: number;
  productId: number;
  productName: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
}

export interface Order {
  orderId: number;
  status: string;
  deliveryAddress: string;
  totalAmount: number;
  deliveryFee: number;
  discount: number;
  notes?: string;
  createdAt: string;
  items: OrderItem[];
}

export interface CheckoutDto {
  deliveryAddress: string;
  notes?: string;
  paymentMethod: string;
}

@Injectable({ providedIn: "root" })
export class OrderService {
  constructor(private api: ApiService) {}

  placeOrder(dto: CheckoutDto): Observable<ApiResponse<Order>> {
    return this.api.post<Order>("api/order/checkout", dto);
  }

  getOrder(orderId: number): Observable<ApiResponse<Order>> {
    return this.api.get<Order>(`api/order/${orderId}`);
  }

  getOrderHistory(): Observable<ApiResponse<Order[]>> {
    return this.api.get<Order[]>("api/order/history");
  }

  reorder(orderId: number): Observable<ApiResponse<Order>> {
    return this.api.post<Order>(`api/order/${orderId}/reorder`, {});
  }
}
