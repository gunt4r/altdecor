import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './components/layouts/admin-layout/admin-layout.component';
import { SiteConfigComponent } from './components/pages/site-config/site-config.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'site-config', pathMatch: 'full' },
      { path: 'site-config', component: SiteConfigComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
