import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PageSlug} from "./client/modules/shared/components/page-container/pages.type";
import {Page} from "../theme/admin/interfaces/page.interface";
import {isAuthenticatedGuard, isNotAuthenticatedGuard} from "../theme/auth/auth.guard";

const appRoutes: Routes = [
  {
    path: '',
    loadChildren: () => import('./client/client.module').then(m => m.ClientModule)
  },
  {
    path: Page.Admin,
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [isAuthenticatedGuard]
  },
  {
    path: Page.Auth,
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
    canActivate: [isNotAuthenticatedGuard]
  },
  {
    path: '**',
    redirectTo: PageSlug.NotFound
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(
      appRoutes
    )
  ],
  exports: [
    RouterModule
  ]
})
export class ProjectRoutingModule {
}
