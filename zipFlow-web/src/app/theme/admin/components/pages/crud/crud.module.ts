import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ListComponent} from './list/list.component';
import {RouterModule} from '@angular/router';
import {DetailsComponent} from "./details/details.component";
import {SharedModule} from "../../shared/shared.module";
import {CrudRoutes} from "./crud-routing";
import {ToastrService} from "ngx-toastr";
import {TableActionsDirective} from "../../directives/table-actions.directive";
import {SvgIconComponent} from "angular-svg-icon";
import {PipesModule} from "../../../pipes/pipes.module";

@NgModule({
  declarations: [
    ListComponent,
    DetailsComponent
  ],
  providers: [ToastrService],
  imports: [
    RouterModule.forChild(CrudRoutes),
    CommonModule,
    SharedModule,
    TableActionsDirective,
    SvgIconComponent,
    PipesModule
  ]
})
export class CrudModule {
}
