import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api.service';

interface AdminProduct {
  id: number;
  name: string;
  price: number;
  originalPrice: number | null;
  category: string;
  categoryId: number;
  image: string;
  description: string | null;
  badgeText: string | null;
  badgeType: string | null;
  inventory: number;
  isActive: boolean;
}

interface Category {
  id: number;
  name: string;
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  products: AdminProduct[] = [];
  categories: Category[] = [];
  loading = true;
  saving = false;
  errorMsg = '';
  successMsg = '';

  // Form state
  showForm = false;
  editingId: number | null = null;

  form = {
    name: '',
    price: 0,
    originalPrice: null as number | null,
    categoryId: 0,
    image: '',
    description: '',
    badgeText: '',
    badgeType: '',
    inventory: 0,
    isActive: true,
  };

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    this.loading = true;
    try {
      const [products, categories] = await Promise.all([
        this.api.getAdminProducts().toPromise(),
        this.api.getCategories().toPromise(),
      ]);
      this.products = products ?? [];
      this.categories = categories ?? [];
    } catch (err: any) {
      this.errorMsg = err?.error?.error ?? 'Failed to load data. Are you signed in?';
    } finally {
      this.loading = false;
    }
  }

  openAdd(): void {
    this.editingId = null;
    this.form = {
      name: '',
      price: 0,
      originalPrice: null,
      categoryId: this.categories[0]?.id ?? 0,
      image: '',
      description: '',
      badgeText: '',
      badgeType: '',
      inventory: 0,
      isActive: true,
    };
    this.showForm = true;
    this.errorMsg = '';
    this.successMsg = '';
  }

  openEdit(p: AdminProduct): void {
    this.editingId = p.id;
    this.form = {
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice,
      categoryId: p.categoryId,
      image: p.image ?? '',
      description: p.description ?? '',
      badgeText: p.badgeText ?? '',
      badgeType: p.badgeType ?? '',
      inventory: p.inventory,
      isActive: p.isActive,
    };
    this.showForm = true;
    this.errorMsg = '';
    this.successMsg = '';
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
  }

  async saveProduct(): Promise<void> {
    if (!this.form.name.trim() || !this.form.price || !this.form.categoryId) {
      this.errorMsg = 'Name, price, and category are required.';
      return;
    }

    this.saving = true;
    this.errorMsg = '';
    this.successMsg = '';

    const payload = {
      name: this.form.name.trim(),
      price: this.form.price,
      originalPrice: this.form.originalPrice || null,
      categoryId: this.form.categoryId,
      image: this.form.image.trim() || null,
      description: this.form.description.trim() || null,
      badgeText: this.form.badgeText.trim() || null,
      badgeType: this.form.badgeType || null,
      inventory: this.form.inventory,
      isActive: this.form.isActive,
    };

    try {
      if (this.editingId !== null) {
        await this.api.updateProduct(this.editingId, payload).toPromise();
        this.successMsg = 'Product updated successfully!';
      } else {
        await this.api.createProduct(payload).toPromise();
        this.successMsg = 'Product added successfully!';
      }
      this.showForm = false;
      await this.loadData();
    } catch (err: any) {
      if (err?.error?.errors) {
        this.errorMsg = err.error.errors.map((e: any) => e.msg).join(' ');
      } else {
        this.errorMsg = err?.error?.error ?? 'Failed to save product.';
      }
    } finally {
      this.saving = false;
    }
  }

  async deleteProduct(p: AdminProduct): Promise<void> {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await this.api.deleteProduct(p.id).toPromise();
      this.successMsg = `"${p.name}" deleted.`;
      await this.loadData();
    } catch (err: any) {
      this.errorMsg = err?.error?.error ?? 'Failed to delete product.';
    }
  }
}
