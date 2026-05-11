import { NgModule } from '@angular/core';
import { CoreModule } from './modules/core/core.module';
import { LandingModule } from './modules/landing/landing.module';

@NgModule({
  imports: [CoreModule, LandingModule],
  exports: [CoreModule, LandingModule]
})
export class ClientModule {}
