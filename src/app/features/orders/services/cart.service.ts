import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { ApiService } from "../../../core/services/api.service";
import { ApiResponse } from "../../../core/models/api-response.model";

export interface CartItem {
  cartItemId: number;
  productId: number;
  productName: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
}

export interface CartResponse {
  cartId: number;
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
}

@Injectable({ providedIn: "root" })
export class CartService {
  private cartSubject = new BehaviorSubject<CartResponse | null>(null);
  cart$ = this.cartSubject.asObservable();

  constructor(private api: ApiService) {}

  getCart(): Observable<ApiResponse<CartResponse>> {
    return this.api.get<CartResponse>("api/cart").pipe(
      tap(res => { if (res.success && res.data) this.cartSubject.next(res.data); })
    );
  }

  addToCart(productId: number, quantity: number = 1): Observable<ApiResponse<CartResponse>> {
    return this.api.post<CartResponse>("api/cart/add", { productId, quantity }).pipe(
      tap(res => { if (res.success && res.data) this.cartSubject.next(res.data); })
    );
  }

  updateItem(cartItemId: number, quantity: number): Observable<ApiResponse<CartResponse>> {
    return this.api.put<CartResponse>(`api/cart/item/${cartItemId}`, { quantity }).pipe(
      tap(res => { if (res.success && res.data) this.cartSubject.next(res.data); })
    );
  }

  removeItem(cartItemId: number): Observable<ApiResponse<CartResponse>> {
    return this.api.delete<CartResponse>(`api/cart/item/${cartItemId}`).pipe(
      tap(res => { if (res.success && res.data) this.cartSubject.next(res.data); })
    );
  }

  clearCart(): Observable<ApiResponse<any>> {
    return this.api.delete("api/cart/clear").pipe(
      tap(() => this.cartSubject.next(null))
    );
  }

  getCartCount(): number {
    return this.cartSubject.value?.totalItems ?? 0;
  }
}
