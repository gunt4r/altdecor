import {NgModule} from '@angular/core';
import {MetaService} from "./meta.service";
import {EmailService} from "./email.service";
import {QueryParamsService} from "./query-params.service";
import {LoaderService} from "./loader.service";
import {PublicService} from "../../../project/client/modules/shared/services/public.service";

@NgModule({
  declarations: [],
  providers: [MetaService, EmailService, QueryParamsService, LoaderService, PublicService],
  exports: []
})
export class SharedServicesModule {
}
