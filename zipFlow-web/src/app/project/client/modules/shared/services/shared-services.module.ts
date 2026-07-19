import {NgModule} from '@angular/core';
import {MetaService} from "./meta.service";
import {EmailService} from "./email.service";
import {CartProductService} from "./cart-products.service";
import {TruncateService} from "./truncate.service";
import {ToastrModule, ToastrService} from "ngx-toastr";

@NgModule({
  imports: [
    ToastrModule.forRoot({
      timeOut: 3000,
      extendedTimeOut: 2000,
      tapToDismiss: true,
      positionClass: 'toast-bottom-right',
      progressBar: true,
      closeButton: true,
      preventDuplicates: true
    })
  ],
  declarations: [],
  providers: [ToastrService, MetaService, EmailService, CartProductService, TruncateService],
  exports: []
})
export class SharedServicesModule {
}

