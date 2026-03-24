import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseCompatService } from '../../core/firebase-compat.service';

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
    private readonly firebaseCompat: FirebaseCompatService,
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
      const auth = this.firebaseCompat.auth();
      await auth.signInWithEmailAndPassword(email, this.password);
      alert('Login successful!');
      await this.router.navigateByUrl('/shop');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(msg);
    }
  }
}
