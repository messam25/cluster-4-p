import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseCompatService } from '../../core/firebase-compat.service';

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

  constructor(
    private readonly firebaseCompat: FirebaseCompatService,
    private readonly router: Router,
  ) {}

  async onSubmit(ev: Event): Promise<void> {
    ev.preventDefault();
    const email = this.email.trim();
    if (!this.fullName.trim() || !email || !this.password) {
      return;
    }
    if (!this.termsAccepted) {
      alert('You must agree to the terms.');
      return;
    }
    try {
      const auth = this.firebaseCompat.auth();
      await auth.createUserWithEmailAndPassword(email, this.password);
      alert('Account created! You can sign in now.');
      await this.router.navigateByUrl('/signin');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(msg);
    }
  }
}
