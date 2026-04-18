import { Component } from '@angular/core';
import {
  FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

function passwordMatch(group: AbstractControl): ValidationErrors | null {
  const pass = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return pass === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  error = '';
  successMsg = '';
  showPassword = false;
  showConfirm = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      addressLine: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    }, { validators: passwordMatch });
  }

  f(name: string) { return this.form.get(name)!; }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error = '';
    this.successMsg = '';

    const { confirmPassword, ...payload } = this.form.value;

    this.authService.register(payload).subscribe({
      next: () => {
        this.successMsg = 'Account created! Please verify your email before logging in.';
        this.loading = false;
        setTimeout(() => this.router.navigate(['/auth/login']), 2500);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Registration failed. Try again.';
        this.loading = false;
      }
    });
  }
}