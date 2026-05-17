import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ListComponent} from './list/list.component';
import {RouterModule} from '@angular/router';
import {DetailsComponent} from "./details/details.component";
import {SharedModule} from "../../shared/shared.module";
import {EmailsRoutes} from "./emails-routing";
import {ToastrService} from "ngx-toastr";
import {SvgIconComponent} from "angular-svg-icon";
import {TableActionsDirective} from "../../directives/table-actions.directive";
import {PipesModule} from "../../../pipes/pipes.module";

@NgModule({
  declarations: [
    ListComponent,
    DetailsComponent
  ],
  imports: [
    RouterModule.forChild(EmailsRoutes),
    CommonModule,
    SharedModule,
    TableActionsDirective,
    SvgIconComponent,
    PipesModule
  ],
  providers: [
    ToastrService
  ]
})
export class EmailsModule {
}
