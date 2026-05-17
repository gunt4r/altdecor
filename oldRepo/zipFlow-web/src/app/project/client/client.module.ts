import {NgModule} from '@angular/core';
import {SharedModule} from "./modules/shared/shared.module";
import {LandingModule} from "./modules/landing/landing.module";
import {CommonModule} from "@angular/common";

@NgModule({
  imports: [SharedModule, LandingModule, CommonModule],
  exports: []
})
export class ClientModule {
}
