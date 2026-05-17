import {NgModule} from '@angular/core';
import {SharedServicesModule} from "./services/shared-services.module";
import {SharedDirectivesModule} from "./directives/shared-directives.module";
import {SharedPipesModule} from "./pipes/shared-pipes.module";
import {SharedComponentsModule} from "./components/shared-components.module";

@NgModule({
  imports: [
    SharedServicesModule,
    SharedDirectivesModule,
    SharedPipesModule,
    SharedComponentsModule
  ],
  exports: [
    SharedServicesModule,
    SharedDirectivesModule,
    SharedPipesModule,
    SharedComponentsModule,
  ]
})
export class SharedModule {
}
