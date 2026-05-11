import { NgModule } from '@angular/core';
import { ProjectRoutingModule } from './project-routing.module';
import { ClientModule } from './client/client.module';
import { SharedModule } from './client/modules/shared/shared.module';
import { SiteShellComponent } from './client/modules/shared/components/site-shell/site-shell.component';
import { PlaceholderPageComponent } from './client/modules/shared/components/placeholder-page/placeholder-page.component';

@NgModule({
  declarations: [SiteShellComponent, PlaceholderPageComponent],
  imports: [SharedModule, ClientModule, ProjectRoutingModule]
})
export class ProjectModule {}
