import { Component, OnInit } from '@angular/core';
import { ApiService, Product } from '../../core/api.service';

export interface ShopProduct {
  name: string;
  price: number;
  category: string;
  image: string;
  badge: { text: string; type: string } | null;
  originalPrice?: number;
}

const SORT_MAP: Record<string, string> = {
  'Price: Low to High': 'price_asc',
  'Price: High to Low': 'price_desc',
  'Newest Arrivals': 'newest',
};

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

  private allProducts: ShopProduct[] = [];
  displayedProducts: ShopProduct[] = [];
  loading = false;

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    this.fetchProducts();
  }

  async fetchProducts(): Promise<void> {
    this.loading = true;
    try {
      const sortParam = SORT_MAP[this.sortBy];
      const products: Product[] =
        (await this.api.getProducts(this.selectedCategory, sortParam).toPromise()) ?? [];
      this.allProducts = products;
      this.applyFilters();
    } catch (e) {
      console.error('Failed to load products', e);
    } finally {
      this.loading = false;
    }
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
      await this.api
        .addToCart({
          name: product.name,
          price: product.price,
          category: product.category,
          image: product.image,
        })
        .toPromise();
      alert(`"${product.name}" added to cart successfully!`);
    } catch (e) {
      console.error(e);
      const msg = (e as any)?.error?.error ?? 'Failed to add product. Try again.';
      alert(msg);
    }
  }
}
