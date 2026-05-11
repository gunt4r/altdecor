import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SiteShellComponent } from './client/modules/shared/components/site-shell/site-shell.component';
import { PlaceholderPageComponent } from './client/modules/shared/components/placeholder-page/placeholder-page.component';
import { HomeComponent } from './client/modules/landing/pages/home/home.component';

const routes: Routes = [
  {
    path: '',
    component: SiteShellComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'products', component: PlaceholderPageComponent, data: { title: 'Products' } },
      { path: 'products/:id', component: PlaceholderPageComponent, data: { title: 'Product details' } },
      { path: 'contacts', component: PlaceholderPageComponent, data: { title: 'Contacts' } },
      { path: 'blog', component: PlaceholderPageComponent, data: { title: 'Blog' } },
      { path: 'about-us', component: PlaceholderPageComponent, data: { title: 'About us' } },
      { path: 'faq', component: PlaceholderPageComponent, data: { title: 'Delivery and payment' } },
      { path: 'checkout', component: PlaceholderPageComponent, data: { title: 'Checkout' } },
      { path: 'not-found', component: PlaceholderPageComponent, data: { title: 'Page not found' } }
    ]
  },
  {
    path: 'admin',
    loadChildren: () => import('../theme/admin/admin.module').then((m) => m.AdminModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule)
  },
  {
    path: '**',
    redirectTo: 'not-found'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectRoutingModule {}
