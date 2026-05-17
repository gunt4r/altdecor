import {Component, Inject, OnDestroy, PLATFORM_ID} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable, Subscription} from 'rxjs';
import {anyObj} from "../../../interfaces/shared.types.interface";
import {PermissionsService} from "../../../services/permissions.service";
import {selectPermissions, selectProfile, selectRolesIds} from "../../../store/selectors/user.selectors";
import {Entities} from "../../../dictionary/permissions.dictionary";
import {isPlatformBrowser} from "@angular/common";

@Component({
  template: ''
})

export class AbstractComponent implements OnDestroy {
  // @ts-ignore
  public user$: Observable<any>;
  // @ts-ignore
  public permissions$: Observable<any>;
  // @ts-ignore
  public rolesIds$: Observable<any>;
  // @ts-ignore
  public user: anyObj | null = null;
  public permissions: anyObj | null = null;
  public rolesIds: number[] | null = null;
  subscriptions: Subscription[] = [];

  constructor(protected store: Store,
              protected permissionsService: PermissionsService,
              @Inject(PLATFORM_ID) protected platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.user$ = this.store.select(selectProfile);
      this.permissions$ = this.store.select(selectPermissions);
      this.rolesIds$ = this.store.select(selectRolesIds);
      this.subscriptions.push(this.user$.subscribe(user => (this.user = user)));
      this.subscriptions.push(this.permissions$.subscribe(data => (this.permissions = data?.permissions)));
      this.subscriptions.push(this.rolesIds$.subscribe(data => (this.rolesIds = data?.rolesIds)));
    }
  }

  can(entity: Entities | undefined, action: string | undefined, resource: any = null): boolean {
    const user = {
      id: this.user?.['id'],
      rolesIds: this.rolesIds,
      permissions: this.permissions
    };

    return this.permissionsService.can(user, entity, action, resource);
  }

  ngOnDestroy() {
    this.subscriptions.map(sub => sub?.unsubscribe());
  }
}
