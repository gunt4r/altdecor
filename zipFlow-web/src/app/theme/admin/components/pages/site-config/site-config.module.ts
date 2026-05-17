import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SiteConfigComponent } from './site-config.component';

const routes: Routes = [{ path: '', component: SiteConfigComponent }];

@NgModule({
  declarations: [SiteConfigComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule.forChild(routes)]
})
export class SiteConfigModule {}
