import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../project/client/modules/shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminLayoutComponent } from './components/layouts/admin-layout/admin-layout.component';
import { SiteConfigComponent } from './components/pages/site-config/site-config.component';

@NgModule({
  declarations: [AdminLayoutComponent, SiteConfigComponent],
  imports: [SharedModule, FormsModule, ReactiveFormsModule, AdminRoutingModule]
})
export class AdminModule {}
