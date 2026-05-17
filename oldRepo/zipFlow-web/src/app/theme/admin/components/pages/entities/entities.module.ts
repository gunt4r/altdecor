import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ListComponent} from './list/list.component';
import {RouterModule} from '@angular/router';
import {DetailsComponent} from "./details/details.component";
import {SharedModule} from "../../shared/shared.module";
import {EntitiesRoutes} from "./entities-routing";
import {ToastrService} from "ngx-toastr";
import {CategoryService} from "../../../services/category.service";
import {SvgIconComponent} from "angular-svg-icon";
import {PipesModule} from "../../../pipes/pipes.module";
import {TableActionsDirective} from "../../directives/table-actions.directive";

@NgModule({
  declarations: [
    ListComponent,
    DetailsComponent
  ],
  providers: [ToastrService, CategoryService],
  imports: [
    RouterModule.forChild(EntitiesRoutes),
    CommonModule,
    SharedModule,
    TableActionsDirective,
    SvgIconComponent,
    PipesModule
  ]
})
export class EntitiesModule {
}
