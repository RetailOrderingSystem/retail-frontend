import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any = null;
  isLoggedIn = false;
  loading = true;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check initial login state
    this.isLoggedIn = this.authService.isLoggedIn();
    console.log('Profile Component - isLoggedIn:', this.isLoggedIn);

    if (!this.isLoggedIn) {
      console.log('Profile: User not logged in, redirecting to login');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.loadUserProfile();

    // Subscribe to auth state changes
    this.authService.currentUser$.subscribe(user => {
      console.log('Profile: Auth state changed, user:', user);
      this.user = user;
      this.isLoggedIn = this.authService.isLoggedIn();

      if (!this.isLoggedIn) {
        this.router.navigate(['/auth/login']);
      }
    });
  }

  loadUserProfile(): void {
    this.loading = true;
    this.error = null;

    this.apiService.get('/user/profile').subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.user = response.data;
          console.log('Profile: User data loaded from API:', this.user);
        } else {
          this.error = 'Failed to load user profile';
          console.error('Profile: API response error:', response);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Profile: Error loading user profile:', error);
        this.error = 'Failed to load user profile. Please try again.';
        this.loading = false;

        // If unauthorized, redirect to login
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/auth/login']);
        }
      }
    });
  }

  formatDate(dateStr?: string | null): string {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr || '—';
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}