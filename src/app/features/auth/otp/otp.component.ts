import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.css']
})
export class OtpComponent implements OnInit, OnDestroy {
  form: FormGroup;
  loading = false;
  resending = false;
  error = '';
  email = '';

  timerSeconds = 30;
  canResend = false;
  private timerRef: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  ngOnInit(): void {
    this.email = localStorage.getItem('pendingEmail') || '';
    if (!this.email) this.router.navigate(['/auth/login']);
    this.startTimer();
  }

  ngOnDestroy(): void {
    clearInterval(this.timerRef);
  }

  get otp() { return this.form.get('otp')!; }

  startTimer(): void {
    this.timerSeconds = 30;
    this.canResend = false;
    clearInterval(this.timerRef);
    this.timerRef = setInterval(() => {
      this.timerSeconds--;
      if (this.timerSeconds <= 0) {
        this.canResend = true;
        clearInterval(this.timerRef);
      }
    }, 1000);
  }

  resendOtp(): void {
    if (!this.canResend) return;
    this.resending = true;
    this.error = '';
    this.authService.login(this.email).subscribe({
      next: () => {
        this.resending = false;
        this.startTimer();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to resend OTP.';
        this.resending = false;
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    this.authService.verifyOtp({ email: this.email, otp: this.otp.value }).subscribe({
      next: (res) => {
        this.authService.storeTokens(res.accessToken, res.refreshToken);
        if (res.user) this.authService.storeUser(res.user);
        localStorage.removeItem('pendingEmail');
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Invalid OTP. Please try again.';
        this.loading = false;
      }
    });
  }
}