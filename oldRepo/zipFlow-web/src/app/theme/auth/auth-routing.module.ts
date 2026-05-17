import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from "./pages/login/login.component";
import {Page} from "../admin/interfaces/page.interface";
import {isNotAuthenticatedGuard} from "./auth.guard";

const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
    children: [
      {
        path: Page.Login,
        component: LoginComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {
}
