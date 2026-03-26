import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
  fullName = '';
  email = '';
  password = '';
  termsAccepted = false;
  loading = false;
  errorMsg = '';

  constructor(
    private readonly api: ApiService,
    private readonly router: Router,
  ) {}

  async onSubmit(ev: Event): Promise<void> {
    ev.preventDefault();
    this.errorMsg = '';

    const fullName = this.fullName.trim();
    const email = this.email.trim();
    const password = this.password;

    if (!fullName || !email || !password) {
      this.errorMsg = 'Please fill in all fields.';
      return;
    }
    if (password.length < 6) {
      this.errorMsg = 'Password must be at least 6 characters.';
      return;
    }
    if (!this.termsAccepted) {
      this.errorMsg = 'You must agree to the terms.';
      return;
    }

    this.loading = true;
    try {
      const res = await this.api.signup(fullName, email, password).toPromise();
      if (res?.token) {
        this.api.saveToken(res.token);
        await this.api.syncGuestCart();
      }
      alert('Account created! Please sign in.');
      await this.router.navigateByUrl('/signin');
    } catch (err: any) {
      // Handle API error response shapes
      if (err?.error?.error) {
        this.errorMsg = err.error.error;
      } else if (err?.error?.errors) {
        this.errorMsg = err.error.errors.map((e: any) => e.msg).join(' ');
      } else if (err?.message) {
        this.errorMsg = err.message;
      } else {
        this.errorMsg = 'Signup failed. Please try again.';
      }
    } finally {
      this.loading = false;
    }
  }
}
