import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule) },
      { path: 'about', loadChildren: () => import('./pages/about/about.module').then(m => m.AboutModule) },
      { path: 'contact', loadChildren: () => import('./pages/contact/contact.module').then(m => m.ContactModule) },
      { path: 'shop', loadChildren: () => import('./pages/shop/shop.module').then(m => m.ShopModule) },
      { path: 'product/:id', loadChildren: () => import('./pages/product-detail/product-detail.module').then(m => m.ProductDetailModule) },
      { path: 'cart', loadChildren: () => import('./pages/cart/cart.module').then(m => m.CartModule) },
      { path: 'privacy', loadChildren: () => import('./pages/privacy/privacy.module').then(m => m.PrivacyModule) },
      { path: 'blog', loadChildren: () => import('./pages/blog/blog.module').then(m => m.BlogModule) },
    ],
  },
  { path: 'signin', loadChildren: () => import('./pages/signin/signin.module').then(m => m.SigninModule) },
  { path: 'signup', loadChildren: () => import('./pages/signup/signup.module').then(m => m.SignupModule) },
  { path: 'admin', loadChildren: () => import('./pages/admin/admin.module').then(m => m.AdminModule) },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
