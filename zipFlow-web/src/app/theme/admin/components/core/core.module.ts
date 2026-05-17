import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {SharedModule} from '../shared/shared.module';
import {NavbarComponent} from "./navbar/navbar.component";
import {AbstractComponent} from "./abstract/abstract.component";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {AngularSvgIconModule} from "angular-svg-icon";
import {SidebarComponent} from "./sidebar/sidebar.component";
import {FooterComponent} from "./footer/footer.component";
import {PipesModule} from "../../pipes/pipes.module";


@NgModule({
  declarations: [
    NavbarComponent,
    SidebarComponent,
    FooterComponent,
    AbstractComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    NgbModule,
    FontAwesomeModule,
    AngularSvgIconModule.forRoot(),
    PipesModule
  ],
  exports: [
    NavbarComponent,
    SidebarComponent,
    FooterComponent,
    AbstractComponent,
    NgbModule
  ]
})
export class CoreModule { }
