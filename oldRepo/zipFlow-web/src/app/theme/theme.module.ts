import {NgModule} from '@angular/core';
import {ClientModule} from "./client/client.module";
import {AdminModule} from "./admin/admin.module";
import {ThemeRoutingModule} from "./theme-routing.module";
import {CommonModule} from "@angular/common";
import {StoreModule} from "@ngrx/store";
import {metaReducers, reducers} from "./admin/store/reducers";

@NgModule({
  imports: [CommonModule, ClientModule, AdminModule, ThemeRoutingModule,
    StoreModule.forRoot(reducers, {
      metaReducers
    })
  ],
  exports: []
})
export class ThemeModule {
}
