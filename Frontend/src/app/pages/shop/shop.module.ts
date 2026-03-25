import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ShopComponent } from './shop.component';

const routes: Routes = [{ path: '', component: ShopComponent }];

@NgModule({
  declarations: [ShopComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgOptimizedImage,
    RouterModule.forChild(routes)
  ]
})
export class ShopModule { }
