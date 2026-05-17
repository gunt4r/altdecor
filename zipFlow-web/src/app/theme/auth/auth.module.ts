import {NgModule} from '@angular/core';
import {AuthRoutingModule} from "./auth-routing.module";
import {LoginComponent} from "./pages/login/login.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";

@NgModule({
  declarations: [LoginComponent],
  imports: [AuthRoutingModule, ReactiveFormsModule, FormsModule, CommonModule]
})
export class AuthModule {
}
