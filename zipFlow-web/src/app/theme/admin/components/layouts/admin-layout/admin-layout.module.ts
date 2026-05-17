import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {AdminLayoutRoutes} from './admin-layout.routing';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {UnauthorizedComponent} from "../../pages/unauthorized/unauthorized.component";
import {ConfirmationDialogService} from "../../../services/confirmation-dialog.service";
import {CoreModule} from "../../core/core.module";
import {SharedModule} from "../../shared/shared.module";
import {HomeComponent} from "../../pages/home/home.component";

@NgModule({
  imports: [
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    NgbModule,
    CommonModule,
    CoreModule,
    SharedModule
  ],
  declarations: [
    HomeComponent,
    UnauthorizedComponent
  ],
  providers: [ConfirmationDialogService]
})
export class AdminLayoutModule {}
