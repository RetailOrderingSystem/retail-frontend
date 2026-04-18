import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, Coupon, CreateCouponDto } from '../services/admin.service';

@Component({
  selector: 'app-coupons',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './coupons.component.html',
  styleUrls: ['./coupons.component.css']
})
export class CouponsComponent implements OnInit {
  coupons: Coupon[] = [];
  loading = true;
  showForm = false;
  actionMessage = '';
  errorMessage = '';

  form: CreateCouponDto = {
    code: '',
    discountType: 'Percentage',
    discountValue: 0,
    minOrderAmount: undefined,
    maxUsageCount: undefined,
    expiresAt: undefined
  };

  editingId: number | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadCoupons();
  }

  loadCoupons(): void {
    this.loading = true;
    this.adminService.getAllCoupons().subscribe({
      next: res => {
        if (res.success) this.coupons = res.data!;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load coupons.';
        this.loading = false;
      }
    });
  }

  openCreate(): void {
    this.editingId = null;
    this.form = { code: '', discountType: 'Percentage', discountValue: 0 };
    this.showForm = true;
  }

  openEdit(coupon: Coupon): void {
    this.editingId = coupon.couponId;
    this.form = {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      maxUsageCount: coupon.maxUsageCount,
      expiresAt: coupon.expiresAt ? coupon.expiresAt.substring(0, 10) : undefined
    };
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingId = null;
  }

  submitForm(): void {
    if (this.editingId) {
      this.adminService.updateCoupon(this.editingId, this.form).subscribe({
        next: res => {
          if (res.success) {
            this.actionMessage = 'Coupon updated.';
            this.closeForm();
            this.loadCoupons();
            setTimeout(() => this.actionMessage = '', 3000);
          }
        },
        error: () => this.errorMessage = 'Failed to update coupon.'
      });
    } else {
      this.adminService.createCoupon(this.form).subscribe({
        next: res => {
          if (res.success) {
            this.actionMessage = 'Coupon created.';
            this.closeForm();
            this.loadCoupons();
            setTimeout(() => this.actionMessage = '', 3000);
          }
        },
        error: () => this.errorMessage = 'Failed to create coupon.'
      });
    }
  }

  deleteCoupon(couponId: number): void {
    if (!confirm('Delete this coupon?')) return;
    this.adminService.deleteCoupon(couponId).subscribe({
      next: res => {
        if (res.success) {
          this.coupons = this.coupons.filter(c => c.couponId !== couponId);
          this.actionMessage = 'Coupon deleted.';
          setTimeout(() => this.actionMessage = '', 3000);
        }
      },
      error: () => this.errorMessage = 'Failed to delete coupon.'
    });
  }

  toggleActive(coupon: Coupon): void {
    this.adminService.updateCoupon(coupon.couponId, { isActive: !coupon.isActive }).subscribe({
      next: res => {
        if (res.success) {
          coupon.isActive = !coupon.isActive;
          this.actionMessage = `Coupon ${coupon.isActive ? 'activated' : 'deactivated'}.`;
          setTimeout(() => this.actionMessage = '', 3000);
        }
      }
    });
  }
}
