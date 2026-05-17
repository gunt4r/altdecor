import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ListComponent} from './list/list.component';
import {RouterModule} from '@angular/router';
import {DetailsComponent} from "./details/details.component";
import {SharedModule} from "../../shared/shared.module";
import {AnalyticsRoutes} from "./analytics-routing";
import {ToastrService} from "ngx-toastr";

@NgModule({
  declarations: [
    ListComponent,
    DetailsComponent
  ],
  imports: [
    RouterModule.forChild(AnalyticsRoutes),
    CommonModule,
    SharedModule
  ],
  providers: [
    ToastrService
  ]
})
export class AnalyticsModule {
}
