import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthResponse {
  token: string;
  user: { userId: number; fullName: string; email: string };
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  quantity: number;
  addedAt: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  image: string;
  badge: { text: string; type: string } | null;
  originalPrice?: number;
}

export interface ContactPayload {
  fullName: string;
  email: string;
  subject: string;
  message: string;
}

const TOKEN_KEY = 'jg_token';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly base = environment.apiUrl;
  private authStatus = new BehaviorSubject<boolean>(this.hasToken());
  authStatus$ = this.authStatus.asObservable();

  constructor(private readonly http: HttpClient) {}

  private hasToken(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }

  // ── Token helpers ─────────────────────────────────────────────────────────
  saveToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    this.authStatus.next(true);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.authStatus.next(false);
  }

  private authHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token ?? ''}` });
  }

  // ── Auth ──────────────────────────────────────────────────────────────────
  signup(fullName: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/api/auth/signup`, {
      fullName,
      email,
      password,
    });
  }

  signin(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/api/auth/signin`, {
      email,
      password,
    });
  }

  // ── Products ──────────────────────────────────────────────────────────────
  getProducts(category?: string, sort?: string): Observable<Product[]> {
    let params = new HttpParams();
    if (category && category !== 'All Categories') {
      params = params.set('category', category);
    }
    if (sort) {
      params = params.set('sort', sort);
    }
    return this.http.get<Product[]>(`${this.base}/api/products`, { params });
  }

  getProduct(id: string | number): Observable<Product> {
    return this.http.get<Product>(`${this.base}/api/products/${id}`);
  }

  // ── Cart ──────────────────────────────────────────────────────────────────
  getCart(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(`${this.base}/api/cart`, {
      headers: this.authHeaders(),
    });
  }

  addToCart(product: {
    name: string;
    price: number;
    category: string;
    image: string;
  }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/api/cart`, product, {
      headers: this.authHeaders(),
    });
  }

  removeCartItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/api/cart/${id}`, {
      headers: this.authHeaders(),
    });
  }

  checkoutCart(): Observable<void> {
    return this.http.delete<void>(`${this.base}/api/cart/checkout`, {
      headers: this.authHeaders(),
    });
  }

  // ── Contact ───────────────────────────────────────────────────────────────
  sendContactMessage(data: ContactPayload): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/api/contact`, data);
  }

  // ── Admin ─────────────────────────────────────────────────────────────────
  getAdminProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/api/admin/products`, {
      headers: this.authHeaders(),
    });
  }

  getCategories(): Observable<{ id: number; name: string }[]> {
    return this.http.get<{ id: number; name: string }[]>(`${this.base}/api/admin/categories`, {
      headers: this.authHeaders(),
    });
  }

  createProduct(data: any): Observable<{ id: number; message: string }> {
    return this.http.post<{ id: number; message: string }>(`${this.base}/api/admin/products`, data, {
      headers: this.authHeaders(),
    });
  }

  updateProduct(id: number, data: any): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.base}/api/admin/products/${id}`, data, {
      headers: this.authHeaders(),
    });
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/api/admin/products/${id}`, {
      headers: this.authHeaders(),
    });
  }
}
