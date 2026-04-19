import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { SidebarComponent, SidebarItem } from '../../shared/components/sidebar/sidebar.component';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent, SidebarComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {
  currentUser: User | null = null;
  sidebarItems: SidebarItem[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.sidebarItems = this.getSidebarItems(user);
    });
  }

  private getSidebarItems(user: User | null): SidebarItem[] {
    if (!user) {
      return [];
    }

    if (user.roleName === 'Admin') {
      return [
        { label: 'Dashboard', icon: '📊', route: '/admin' },
        { label: 'Products', icon: '🛒', route: '/admin/products' },
        { label: 'Orders', icon: '📦', route: '/admin/orders' },
        { label: 'Users', icon: '👥', route: '/admin/users' },
        { label: 'Coupons', icon: '🏷️', route: '/admin/coupons' }
      ];
    }

    return [
      { label: 'Menu', icon: '🍽️', route: '/products' },
      { label: 'Cart', icon: '🛒', route: '/cart' },
      { label: 'Orders', icon: '📦', route: '/orders' },
      { label: 'Profile', icon: '👤', route: '/profile' }
    ];
  }
}