import {NgModule} from '@angular/core';
import {ClientModule} from "./client/client.module";
import {ProjectRoutingModule} from "./project-routing.module";
import {CommonModule} from "@angular/common";
import {AuthService} from "../theme/admin/services/auth.service";

@NgModule({
  imports: [ClientModule, ProjectRoutingModule, CommonModule],
  providers: [AuthService],
  exports: []
})
export class ProjectModule {
}
