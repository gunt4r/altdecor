import {NgModule} from '@angular/core';
import {TypeDeleteDirective} from "./type-delete.directive";

@NgModule({
  declarations: [TypeDeleteDirective],
  providers: [],
  exports: [
    TypeDeleteDirective
  ]
})
export class SharedDirectivesModule {
}
