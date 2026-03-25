import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ProductDetailComponent } from './product-detail.component';

import { NgOptimizedImage } from '@angular/common';

const routes: Routes = [{ path: '', component: ProductDetailComponent }];

@NgModule({
  declarations: [ProductDetailComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    NgOptimizedImage
  ]
})
export class ProductDetailModule { }
