import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseCompatService } from '../../core/firebase-compat.service';

export interface CartLine {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  quantity: number;
}

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {
  cartItems: CartLine[] = [];
  loading = true;
  confirmOpen = false;
  successOpen = false;

  constructor(
    private readonly firebaseCompat: FirebaseCompatService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.loadCartItems();
  }

  get cartTitle(): string {
    const n = this.cartItems.length;
    return `Your Cart (${n} item${n === 1 ? '' : 's'})`;
  }

  get subtotal(): number {
    return this.cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  }

  get tax(): number {
    return this.subtotal * 0.08;
  }

  get total(): number {
    return this.subtotal + this.tax;
  }

  get amountToFreeShipping(): number {
    return Math.max(0, 100 - this.subtotal);
  }

  async loadCartItems(): Promise<void> {
    this.loading = true;
    try {
      const db = this.firebaseCompat.firestore();
      const snapshot = await db
        .collection('cart')
        .orderBy('addedAt', 'desc')
        .get();
      this.cartItems = [];
      snapshot.forEach((doc: { id: string; data: () => Record<string, unknown> }) => {
        const d = doc.data();
        this.cartItems.push({
          id: doc.id,
          name: String(d['name'] ?? ''),
          price: Number(d['price'] ?? 0),
          category: String(d['category'] ?? ''),
          image: String(d['image'] ?? ''),
          quantity: 1,
        });
      });
    } catch (e) {
      console.error(e);
      this.cartItems = [];
    } finally {
      this.loading = false;
    }
  }

  updateQuantity(index: number, delta: number): void {
    const item = this.cartItems[index];
    if (!item) {
      return;
    }
    item.quantity = Math.max(1, item.quantity + delta);
  }

  setQuantity(index: number, value: string): void {
    const qty = parseInt(value, 10);
    if (qty > 0 && this.cartItems[index]) {
      this.cartItems[index].quantity = qty;
    }
  }

  async removeItem(item: CartLine): Promise<void> {
    if (!confirm(`Remove "${item.name}" from cart?`)) {
      return;
    }
    try {
      const db = this.firebaseCompat.firestore();
      await db.collection('cart').doc(item.id).delete();
      alert(`"${item.name}" removed from cart`);
      await this.loadCartItems();
    } catch (e) {
      console.error(e);
      alert('Failed to remove item. Please try again.');
    }
  }

  openCheckoutConfirm(): void {
    if (this.cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    this.confirmOpen = true;
  }

  closeConfirm(): void {
    this.confirmOpen = false;
  }

  closeSuccess(): void {
    this.successOpen = false;
    void this.router.navigateByUrl('/shop');
  }

  continueShopping(): void {
    this.successOpen = false;
    void this.router.navigateByUrl('/shop');
  }

  onConfirmBackdrop(ev: MouseEvent): void {
    if (ev.target === ev.currentTarget) {
      this.closeConfirm();
    }
  }

  onSuccessBackdrop(ev: MouseEvent): void {
    if (ev.target === ev.currentTarget) {
      this.closeSuccess();
    }
  }

  async confirmCheckout(): Promise<void> {
    this.closeConfirm();
    this.createConfetti();
    setTimeout(() => {
      this.successOpen = true;
    }, 300);

    try {
      const db = this.firebaseCompat.firestore();
      const batch = db.batch();
      this.cartItems.forEach((item) => {
        batch.delete(db.collection('cart').doc(item.id));
      });
      await batch.commit();
      this.cartItems = [];
    } catch (e) {
      console.error(e);
    }
  }

  private createConfetti(): void {
    const colors = [
      '#11d442',
      '#10c23d',
      '#0fb83a',
      '#FFD700',
      '#FF6B6B',
      '#4ECDC4',
    ];
    const confettiCount = 50;
    for (let i = 0; i < confettiCount; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor =
          colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        confetti.style.animationDuration = Math.random() * 2 + 2 + 's';
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 4000);
      }, i * 30);
    }
  }
}
