import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { CartComponent } from './cart/cart.component';

@NgModule({
  declarations: [HeaderComponent, FooterComponent, CartComponent],
  imports: [SharedModule],
  exports: [HeaderComponent, FooterComponent, CartComponent]
})
export class CoreModule {}
