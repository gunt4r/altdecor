import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ListComponent} from './list/list.component';
import {RouterModule} from '@angular/router';
import {ImagesRoutes} from "./images-routing";
import {ToastrService} from "ngx-toastr";
import {FormsModule} from "@angular/forms";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {SharedModule} from "../../shared/shared.module";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {ClipboardModule} from "@angular/cdk/clipboard";

@NgModule({
  declarations: [
    ListComponent
  ],
  imports: [
    RouterModule.forChild(ImagesRoutes),
    CommonModule,
    FormsModule,
    NgbModule,
    SharedModule,
    FaIconComponent,
    ClipboardModule
  ],
  providers: [
    ToastrService
  ]
})
export class ImagesModule {
}
