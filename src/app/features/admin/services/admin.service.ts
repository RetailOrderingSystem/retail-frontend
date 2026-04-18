import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../core/models/api-response.model';

export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
}

export interface AdminUser {
  userId: number;
  fullName: string;
  email: string;
  phone?: string;
  roleName: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface AdminOrder {
  orderId: number;
  userName: string;
  userEmail: string;
  totalAmount: number;
  status: string;
  paymentStatus?: string;
  paymentMethod?: string;
  createdAt: string;
  items: AdminOrderItem[];
}

export interface AdminOrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Coupon {
  couponId: number;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderAmount?: number;
  maxUsageCount?: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}

export interface CreateCouponDto {
  code: string;
  discountType: string;
  discountValue: number;
  minOrderAmount?: number;
  maxUsageCount?: number;
  expiresAt?: string;
}

export interface Payment {
  paymentId: number;
  orderId: number;
  method: string;
  status: string;
  amount: number;
  transactionId?: string;
  paidAt: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private api: ApiService) {}

  // ─── Dashboard ─────────────────────────────────────────────────────────────
  getDashboardStats(): Observable<ApiResponse<DashboardStats>> {
    return this.api.get<DashboardStats>('admin/dashboard');
  }

  // ─── Users ─────────────────────────────────────────────────────────────────
  getAllUsers(): Observable<ApiResponse<AdminUser[]>> {
    return this.api.get<AdminUser[]>('admin/users');
  }

  toggleUserStatus(userId: number, isActive: boolean): Observable<ApiResponse<any>> {
    return this.api.put(`admin/users/${userId}/status`, { isActive });
  }

  deleteUser(userId: number): Observable<ApiResponse<any>> {
    return this.api.delete(`admin/users/${userId}`);
  }

  // ─── Orders ────────────────────────────────────────────────────────────────
  getAllOrders(): Observable<ApiResponse<AdminOrder[]>> {
    return this.api.get<AdminOrder[]>('admin/orders');
  }

  getOrderById(orderId: number): Observable<ApiResponse<AdminOrder>> {
    return this.api.get<AdminOrder>(`admin/orders/${orderId}`);
  }

  updateOrderStatus(orderId: number, status: string): Observable<ApiResponse<any>> {
    return this.api.put(`admin/orders/${orderId}/status`, { status });
  }

  // ─── Coupons ───────────────────────────────────────────────────────────────
  getAllCoupons(): Observable<ApiResponse<Coupon[]>> {
    return this.api.get<Coupon[]>('payment/coupons');
  }

  createCoupon(dto: CreateCouponDto): Observable<ApiResponse<Coupon>> {
    return this.api.post<Coupon>('payment/coupons', dto);
  }

  updateCoupon(couponId: number, dto: Partial<CreateCouponDto> & { isActive?: boolean }): Observable<ApiResponse<any>> {
    return this.api.put(`payment/coupons/${couponId}`, dto);
  }

  deleteCoupon(couponId: number): Observable<ApiResponse<any>> {
    return this.api.delete(`payment/coupons/${couponId}`);
  }

  // ─── Payments ──────────────────────────────────────────────────────────────
  getAllPayments(): Observable<ApiResponse<Payment[]>> {
    return this.api.get<Payment[]>('payment');
  }

  updatePaymentStatus(paymentId: number, status: string): Observable<ApiResponse<any>> {
    return this.api.put(`payment/${paymentId}/status`, { status });
  }
}
