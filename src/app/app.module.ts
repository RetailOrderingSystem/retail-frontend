import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { ProductCardComponent } from './shared/components/product-card/product-card.component';
import { LoaderComponent } from './shared/components/loader/loader.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { OtpComponent } from './features/auth/otp/otp.component';
import { ProfileComponent } from './features/auth/profile/profile.component';
import { ProductListComponent } from './features/products/product-list/product-list.component';
import { ProductDetailsComponent } from './features/products/product-details/product-details.component';
import { FiltersComponent } from './features/products/filters/filters.component';
import { CartComponent } from './features/orders/cart/cart.component';
import { CheckoutComponent } from './features/orders/checkout/checkout.component';
import { OrderHistoryComponent } from './features/orders/order-history/order-history.component';
import { TrackingComponent } from './features/orders/tracking/tracking.component';
import { DashboardComponent } from './features/admin/dashboard/dashboard.component';
import { ManageProductsComponent } from './features/admin/manage-products/manage-products.component';
import { ManageOrdersComponent } from './features/admin/manage-orders/manage-orders.component';
import { ManageUsersComponent } from './features/admin/manage-users/manage-users.component';
import { CouponsComponent } from './features/admin/coupons/coupons.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    SidebarComponent,
    ProductCardComponent,
    LoaderComponent,
    LoginComponent,
    RegisterComponent,
    OtpComponent,
    ProfileComponent,
    ProductListComponent,
    ProductDetailsComponent,
    FiltersComponent,
    CartComponent,
    CheckoutComponent,
    OrderHistoryComponent,
    TrackingComponent,
    DashboardComponent,
    ManageProductsComponent,
    ManageOrdersComponent,
    ManageUsersComponent,
    CouponsComponent,
    MainLayoutComponent,
    AuthLayoutComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
