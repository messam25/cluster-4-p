import { Component, OnInit } from '@angular/core';
import { ApiService, Product } from '../../core/api.service';

export interface ShopProduct {
  id: number;
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
  searchTerm = '';

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

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      list = list.filter((p) => 
        p.name.toLowerCase().includes(term) || 
        p.category.toLowerCase().includes(term)
      );
    }

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

  async importXmlFeed(): Promise<void> {
    try {
      const response = await fetch('/assets/products.xml');
      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      
      const productNodes = xmlDoc.getElementsByTagName('product');
      const loadedProducts: ShopProduct[] = [];
      
      for (let i = 0; i < productNodes.length; i++) {
        const node = productNodes[i];
        const name = node.getElementsByTagName('name')[0]?.textContent || '';
        const category = node.getElementsByTagName('category')[0]?.textContent || '';
        const price = parseFloat(node.getElementsByTagName('price')[0]?.textContent || '0');
        const originalPriceText = node.getElementsByTagName('originalPrice')[0]?.textContent;
        const image = node.getElementsByTagName('image')[0]?.textContent || '';
        const badgeText = node.getElementsByTagName('badge')[0]?.textContent;
        const badgeType = node.getElementsByTagName('badgeType')[0]?.textContent;
        
        let badge = null;
        if (badgeText && badgeType) {
          badge = { text: badgeText, type: badgeType };
        }
        
        const newProduct: ShopProduct = {
          id: i + 1000, // Temporary ID for XML products
          name, category, price, image, badge,
          originalPrice: originalPriceText ? parseFloat(originalPriceText) : undefined
        };
        loadedProducts.push(newProduct);
      }
      
      this.allProducts = [...this.allProducts, ...loadedProducts];
      this.applyFilters();
      alert(`Successfully imported ${loadedProducts.length} products from XML feed!`);
    } catch (error) {
      console.error('Error loading XML feed', error);
      alert('Failed to load XML product feed.');
    }
  }
}
