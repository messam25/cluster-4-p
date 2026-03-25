import { Component } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css'],
})
export class MainLayoutComponent {
  menuOpen = false;
  isLoggedIn$: Observable<boolean>;

  constructor(
    private readonly apiService: ApiService,
    private readonly router: Router
  ) {
    this.isLoggedIn$ = this.apiService.authStatus$;
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  logout(): void {
    this.apiService.clearToken();
    this.closeMenu();
    this.router.navigate(['/signin']);
  }
}
