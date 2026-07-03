import {Component, Inject, PLATFORM_ID} from '@angular/core';
import {AbstractComponent} from "../abstract/abstract.component";
import {NavItemInterface} from "../../../interfaces/nav-item.interface";
import {Store} from "@ngrx/store";
import {Entities, PolicyActions} from "../../../dictionary/permissions.dictionary";
import {PermissionsService} from "../../../services/permissions.service";
import {AuthService} from "../../../services/auth.service";
import {QueryParamsService} from "../../../services/query-params.service";
import {Subject} from "rxjs";
import {debounceTime, distinctUntilChanged} from "rxjs/operators";

@Component({
  selector   : 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls  : ['./navbar.component.scss']
})
export class NavbarComponent extends AbstractComponent {
  public isCollapsed = true;
  public searchTerm = '';
  private searchSubject = new Subject<string>();
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
    private qpService: QueryParamsService,
    @Inject(PLATFORM_ID) protected override platformId: Object
  ) {
    super(store, permissionService, platformId);

    // Global search: writes the `query` param that AbstractListingComponent already
    // reads, so it filters the active list (same mechanism as the per-table search).
    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((value) => {
        value
          ? this.qpService.updateParam('query', value)
          : this.qpService.deleteParam('query');
      });

    // Keep the box in sync with the URL: reflects the active filter and clears
    // itself when navigating to a different entity list (query param drops).
    this.qpService.getParamSubs('query').subscribe((value: string) => {
      this.searchTerm = value || '';
    });
  }

  get entities() {
    return Entities;
  }

  get policyActions() {
    return PolicyActions;
  }

  onSearch(value: string) {
    this.searchTerm = value;
    this.searchSubject.next(value);
  }

  clearSearch() {
    this.searchTerm = '';
    this.qpService.deleteParam('query');
  }

  logout() {
    this.authService.logout();
  }
}
