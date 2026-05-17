import {NgModule} from '@angular/core';
import {SharedServicesModule} from "./services/shared-services.module";
import {SharedDirectivesModule} from "./directives/shared-directives.module";
import {SharedComponentsModule} from "./components/shared-components.module";
import {PipesModule} from "./pipes/pipes.module";

@NgModule({
  imports: [
    SharedServicesModule,
    SharedDirectivesModule,
    SharedComponentsModule,
    PipesModule
  ],
  exports: [
    SharedServicesModule,
    SharedDirectivesModule,
    SharedComponentsModule,
    PipesModule
  ]
})
export class SharedModule {
}
