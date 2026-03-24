import { Component, OnInit } from '@angular/core';
import { FirebaseCompatService } from '../../core/firebase-compat.service';

export interface ShopProduct {
  name: string;
  price: number;
  category: string;
  image: string;
  badge: { text: string; type: string } | null;
  originalPrice?: number;
}

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css'],
})
export class ShopComponent implements OnInit {
  readonly categories: string[] = [
    'All Categories',
    'Hiking & Camping',
    'Footwear',
    'Camping Gear',
    'Apparel',
    'Accessories',
    'Lighting',
    'Cooking',
  ];

  readonly sortOptions: string[] = [
    'Recommended',
    'Price: Low to High',
    'Price: High to Low',
    'Newest Arrivals',
  ];

  selectedCategory = 'All Categories';
  sortBy = 'Recommended';

  private readonly allProducts: ShopProduct[] = [
    {
      name: 'Kingston Trekker',
      price: 120.0,
      category: 'Hiking & Camping',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuASOMTH5MhJVqNeJeGV24XYVal_FPiiGYOy63I-sMwQFHjmggjpOyegBZM6geajAfic79wn3Xil3__-L3t3XyXLKiBsPjHoKmie0mm3MCyzANsH0l1Ug0UJsVJp5Gs4_D7ecGC9Yl4AanodF39ixyGjiGRa6MfmErOMTK5fZFgoScsJJZcDZgZn8c_IDJA21Q6vj5PGYNJ1_c5ZO5D_xVKWXH4lUNnvv7uvMMUHn_uhtcKnbOcQmEXGt9uGW2BJfYitLKx4bSqm2LMW',
      badge: null,
    },
    {
      name: 'Blue Mountain Boots',
      price: 145.0,
      category: 'Footwear',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD25ytRN7A-UA7R-YHzJ6dZn2oPx58JJUdO1Xk2oWPiu6IGpjntcjAqzw_-ZRr2Dsxxapa-baAdPAqFviFvAQefdJKFbPYp5MjgQeJypH9YT7Bnj_NhgFLU7yusUyB9rvzZsYXUYqIkNm9swtyW2whOFjetmVzV0QS2PFi-Fp2qmUjovUfPa5oY7vttVZg1zTp6ejEE_B8stkucty6AAHi3Fyb9ziojBShLXN5HMz94k97vTWmK111ZMvXmFC3kIes6oW8gcP6wPo4G',
      badge: null,
    },
    {
      name: 'Negril Beach Tent',
      price: 89.0,
      category: 'Camping Gear',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCIvEwZI8iEUL36pxjDsVlR5GWHozfhDeXbarHk34wmVxPRvpoXsyGRhzAILxPwllpu4B0TUesgnjRSfSJx67yb57Xsdj0VIriLRwV-4V06VI2_-VyCdsGLHA_KpoeAcDJAysrZulAngbhNmfF2kmUaeRkQLpX9XHREL6LsU9Hs5s8v8qdWiTZWpomQQ5IgVbg2o2G300AvEwH4f-368zBBfbZgC5g4MT1P2TYzDv-Xbq8bmM2JmIrFpd811SIZ5Ckt4EPqeaJFKklG',
      badge: { text: 'Best Seller', type: 'primary' },
    },
    {
      name: 'Ocho Rios Rain Jacket',
      price: 65.0,
      category: 'Apparel',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAMU9RgaImgt2cdLtezrN4eyigKpRxSMGoiSR7cHLLHsuu8BwhD9DNKVVjVvrSUageAoCGvAwvCnoca1_L04pLleI0q0zFQ9OZ6NwxEA4ngly9Qe335m2lTHja-HuxwH64pgbECc0cH4kGlZ0yqMifigGw-McFCurDqPCPygAudAl4k9WoL0l6wAsbo7IoopfSJoNtCJru4SfjYqmKALzLbu-Npg7WmmQnoNMIql_TVnUyu6V1MaRTONb18tqOA8HELCzD1OKWbOzU',
      badge: null,
    },
    {
      name: 'Island Life Bottle',
      price: 32.0,
      category: 'Accessories',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAoBYCaSjyMEkFL_1Nfs10bvK-7tJI91fTQzQr9piLc9J0VEMM-ZY8-xLTgQffCGngzKFXx01ZnLQTxSY8OPurIl7PCX8IIKxf0k8u2MjAxEVYQ3PlK0nSDm7lsuXv_BfYf2l88N2BGpWQXvr-3sJnX4Wz0TPNx0JfzRVI43AZSL0VRa5tAPvanF84L8Y7qOo0yZ97a0b6IBq-mDxA_9oThihWg5RqCYa28EDY8mRytHIdiCprCim__ZDM5fAZbE7SCyE8_7N1fVJSf',
      badge: null,
    },
    {
      name: 'Montego Bay Lantern',
      price: 45.0,
      originalPrice: 60.0,
      category: 'Lighting',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCaodw1a1ATowNuXEHnfWIYifTG6cZM5HzAjZ0Du9azYkvpHkfqhgpVfxo_w0f284Efy_bGWzvbnXrI_IVejs__X050zuOnqzVTJY0klNlukyybJD057gUmjfDJeT7625lL357OSxmvz5y9RcXSoXHeri1cLJziwD3NOy0cC5tZZRCwXdZr2hlkoii2VVt6t53Wmkl1TDM5YOa-_0LyM6Lo2w20jJK1f_MwXPbR5KI_rxEXlgzED6s41cOwTWiN2SIacoQSiYFP5vDK',
      badge: { text: 'Sale', type: 'sale' },
    },
    {
      name: 'Peak Gas Stove',
      price: 55.0,
      category: 'Cooking',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuB4c3D0wAZaTnobrLN1NihZhjF4O-VSfltU5GVP06mPDV7FKQGCJbSAsNovy7MRrUUGMNlnur5-7Itnd1tndBYA4s5BU1RJCu-bleyMJxl4iD_5OWpWbrYxCqjxqdoZnE7rYljIl0gt0yhfjpc9V39x8vPszps_1Xeo-qJCCt-199nJtRbt9TfQYDc_ezcjYav8E2q88Pjq-g3S_0CW0sR4nvaUH59GrZvXBbIl_owvDjTUz6b0xs1uZdRPvEIR7xAPzZ_iEYSP7l_L',
      badge: null,
    },
    {
      name: 'Multi-Tool Pro',
      price: 42.0,
      category: 'Accessories',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuByt6xBzsTpMIlyL1qmGpXcWMASJWUU-uMZvXbyi2Sj1859KyuKSt4Fuba6Ykv8PPU-NuwJaiuD4HWquuMmGy6TWpZttxWgIMbKgLpaHQ4kQcrayUT4ZuY7O4_mtYGiNhZ52tGd0R6kfRyqn5rwZVBtXamI2PDBrVKRGXStapXT6ECqOahFDy3n-rMmE_6vuFXO71r2R70ZqePEP0jped8cVh2ozZu6VxWdiFY1XhVLC3lu_q9NeBHGaW-eAEtUDFpo-yDNrvjO53_i',
      badge: null,
    },
  ];

  displayedProducts: ShopProduct[] = [];

  constructor(private readonly firebaseCompat: FirebaseCompatService) {}

  ngOnInit(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let list =
      this.selectedCategory === 'All Categories'
        ? [...this.allProducts]
        : this.allProducts.filter((p) => p.category === this.selectedCategory);

    switch (this.sortBy) {
      case 'Price: Low to High':
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case 'Price: High to Low':
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case 'Newest Arrivals':
        list = [...list].reverse();
        break;
      default:
        break;
    }

    this.displayedProducts = list;
  }

  async addToCart(product: ShopProduct): Promise<void> {
    if (!confirm(`Do you want to add "${product.name}" to your cart?`)) {
      return;
    }
    try {
      const db = this.firebaseCompat.firestore();
      await db.collection('cart').add({
        name: product.name,
        price: product.price,
        category: product.category,
        image: product.image,
        addedAt: firebase.firestore.Timestamp.now(),
      });
      alert(`"${product.name}" added to cart successfully!`);
    } catch (e) {
      console.error(e);
      alert('Failed to add product. Try again.');
    }
  }
}
