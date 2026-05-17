import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, UrlTree} from '@angular/router';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {AbstractComponent} from "../../core/abstract/abstract.component";
import {UserService} from "../../../services/user.service";
import {anyObj} from "../../../interfaces/shared.types.interface";
import {PermissionsService} from "../../../services/permissions.service";

@Injectable({
  providedIn: 'root'
})
export class PermissionsGuard extends AbstractComponent implements CanActivate {
  constructor(protected override store: Store,
              protected override permissionsService: PermissionsService,
              private router: Router,
              private userService: UserService,
              @Inject(PLATFORM_ID) protected override platformId: Object) {
    super(store, permissionsService, platformId);
  }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    return this.allowOrRedirect$(route.data?.['policy']);
  }

  private allowOrRedirect$(policy: anyObj): Observable<any | UrlTree> {
    // return only after user init
    return new Observable<any>((observer) => {
      this.userService.init().then(() => {
        const isAllowed = this.can(policy?.['entity'], policy?.['action']);

        observer.next(isAllowed || this.router.createUrlTree(['/401'], {queryParams: policy}));
        observer.complete();
      });
    });
  }
}
