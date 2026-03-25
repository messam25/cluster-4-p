import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, Product } from '../../core/api.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading = true;
  error: string | null = null;
  quantity = 1;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: ApiService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.fetchProduct(id);
      } else {
        this.error = 'Product not found.';
        this.loading = false;
      }
    });
  }

  async fetchProduct(id: string): Promise<void> {
    this.loading = true;
    try {
      this.product = await this.api.getProduct(id).toPromise() ?? null;
      if (!this.product) {
        this.error = 'Product not found.';
      }
    } catch (err) {
      console.error('Failed to load product', err);
      this.error = 'Failed to load product details. Please try again later.';
    } finally {
      this.loading = false;
    }
  }

  async addToCart(): Promise<void> {
    if (!this.product) return;
    
    try {
      await this.api.addToCart({
        name: this.product.name,
        price: this.product.price,
        category: this.product.category,
        image: this.product.image
      }).toPromise();
      alert(`${this.product.name} added to cart!`);
    } catch (err) {
      console.error(err);
      alert('Failed to add product to cart.');
    }
  }

  goBack(): void {
    this.router.navigate(['/shop']);
  }
}
