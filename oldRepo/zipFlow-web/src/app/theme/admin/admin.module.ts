import {NgModule} from '@angular/core';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {AngularSvgIconModule} from 'angular-svg-icon';

import {AppComponent} from './components/app/app.component';
import {CoreModule} from './components/core/core.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {RouterModule} from '@angular/router';
import {ToastrModule} from 'ngx-toastr';
import {CommonModule} from '@angular/common';
import {AdminLayoutComponent} from "./components/layouts/admin-layout/admin-layout.component";
import {AdminRoutingModule} from "./admin-routing.module";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {environment} from "../../../environments/environment";
import {LoaderService} from "./services/loader.service";
import {SharedModule} from "./components/shared/shared.module";

@NgModule({
  declarations: [
    AppComponent,
    AdminLayoutComponent
  ],
  imports: [
    AdminRoutingModule,
    CoreModule,
    FormsModule,
    NgbModule,
    RouterModule,
    CommonModule,
    FontAwesomeModule,
    ToastrModule.forRoot({
      extendedTimeOut: 2000,
      tapToDismiss: true,
      positionClass: 'toast-top-center',
      preventDuplicates: true
    }),
    AngularSvgIconModule.forRoot(),
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states
      logOnly: environment.production, // Restrict extension to log-only mode
      autoPause: true // Pauses recording actions and state changes when the extension window is not open
    }),
    ReactiveFormsModule,
    SharedModule
  ],

  providers: [
    LoaderService
  ]
})
export class AdminModule {
}
