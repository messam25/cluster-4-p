import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css'],
})
export class SigninComponent {
  email = '';
  password = '';
  passwordVisible = false;

  constructor(
    private readonly api: ApiService,
    private readonly router: Router,
  ) {}

  get passwordInputType(): string {
    return this.passwordVisible ? 'text' : 'password';
  }

  togglePassword(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  async onSubmit(ev: Event): Promise<void> {
    ev.preventDefault();
    const email = this.email.trim();
    if (!email || !this.password) {
      return;
    }
    try {
      const res = await this.api.signin(email, this.password).toPromise();
      if (res) {
        this.api.saveToken(res.token);
        await this.api.syncGuestCart();
      }
      alert('Login successful!');
      await this.router.navigateByUrl('/shop');
    } catch (err: unknown) {
      const msg =
        (err as any)?.error?.error ??
        (err instanceof Error ? err.message : String(err));
      alert(msg);
    }
  }
}
