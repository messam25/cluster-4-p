import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css']
})
export class WishlistComponent implements OnInit {
  wishlist: any[] = [];

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    const stored = localStorage.getItem('guest_wishlist');
    if (stored) {
      this.wishlist = JSON.parse(stored);
    }
  }

  removeItem(id: number): void {
    this.wishlist = this.wishlist.filter(item => item.id !== id);
    localStorage.setItem('guest_wishlist', JSON.stringify(this.wishlist));
  }
}
