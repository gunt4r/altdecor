import {NgModule} from '@angular/core';
import {FooterComponent} from "./footer/footer.component";
import {HeaderComponent} from "./header/header.component";
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SharedModule} from "../shared/shared.module";
import {MatExpansionModule} from "@angular/material/expansion";

@NgModule({
  declarations: [FooterComponent, HeaderComponent],
  exports: [
    FooterComponent,
    HeaderComponent
  ],
  imports: [CommonModule, RouterModule, ReactiveFormsModule, SharedModule, MatExpansionModule, FormsModule]

})
export class CoreModule {
}
