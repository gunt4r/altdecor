import {Component, Inject, PLATFORM_ID} from '@angular/core';
import {AbstractComponent} from "../abstract/abstract.component";
import {NavItemInterface} from "../../../interfaces/nav-item.interface";
import {Store} from "@ngrx/store";
import {Entities, PolicyActions} from "../../../dictionary/permissions.dictionary";
import {PermissionsService} from "../../../services/permissions.service";
import {AuthService} from "../../../services/auth.service";

@Component({
  selector   : 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls  : ['./navbar.component.scss']
})
export class NavbarComponent extends AbstractComponent {
  public isCollapsed = true;
  public navItems: NavItemInterface[] = [
    // {
    //   name: 'Profile',
    //   url : '/profile'
    // }
  ];

  constructor(
    protected override store: Store,
    protected permissionService: PermissionsService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) protected override platformId: Object
  ) {
    super(store, permissionService, platformId);
  }

  get entities() {
    return Entities;
  }

  get policyActions() {
    return PolicyActions;
  }

  logout() {
    this.authService.logout();
  }
}
