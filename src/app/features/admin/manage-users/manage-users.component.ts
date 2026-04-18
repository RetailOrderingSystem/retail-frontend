import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, AdminUser } from '../services/admin.service';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css']
})
export class ManageUsersComponent implements OnInit {
  users: AdminUser[] = [];
  loading = true;
  actionMessage = '';
  errorMessage = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.adminService.getAllUsers().subscribe({
      next: res => {
        if (res.success) this.users = res.data!;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load users.';
        this.loading = false;
      }
    });
  }

  toggleStatus(user: AdminUser): void {
    this.adminService.toggleUserStatus(user.userId, !user.isActive).subscribe({
      next: res => {
        if (res.success) {
          user.isActive = !user.isActive;
          this.actionMessage = res.message;
          setTimeout(() => this.actionMessage = '', 3000);
        }
      },
      error: () => this.errorMessage = 'Failed to update status.'
    });
  }

  deleteUser(userId: number): void {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    this.adminService.deleteUser(userId).subscribe({
      next: res => {
        if (res.success) {
          this.users = this.users.filter(u => u.userId !== userId);
          this.actionMessage = 'User deleted successfully.';
          setTimeout(() => this.actionMessage = '', 3000);
        }
      },
      error: () => this.errorMessage = 'Failed to delete user.'
    });
  }
}
