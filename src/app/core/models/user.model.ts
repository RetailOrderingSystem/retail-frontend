export interface User {
  userId: number;
  fullName: string;
  email: string;
  phone?: string;
  roleId: number;
  roleName?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}