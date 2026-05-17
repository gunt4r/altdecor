import _ from 'lodash';
import {Component, Inject, Input, PLATFORM_ID} from '@angular/core';
import {AbstractComponent} from "../../core/abstract/abstract.component";
import {anyObj} from "../../../interfaces/shared.types.interface";
import {Store} from "@ngrx/store";
import {Entities, PolicyActions} from "../../../dictionary/permissions.dictionary";
import {PermissionsService} from "../../../services/permissions.service";

@Component({
  selector   : 'app-authorization',
  templateUrl: './authorization.component.html',
  styleUrls  : ['./authorization.component.scss']
})
export class AuthorizationComponent extends AbstractComponent {
  // @ts-ignore
  @Input() entity: Entities | undefined;
  // @ts-ignore
  @Input() action: any[] | string | undefined;
  @Input() resource: any;
  @Input() class: string = '';
  @Input() notAllowedMessage = '';

  viewOnly = true;

  constructor(protected override store: Store,
              protected override permissionsService: PermissionsService,
              @Inject(PLATFORM_ID) protected override platformId: Object) {
    super(store, permissionsService, platformId);
  }

  get actionsList() {
    return _.isArray(this.action) ? this.action : [this.action];
  }

  get actionsPermissions(): anyObj {
    const permissions: anyObj = {};
    _.each(this.actionsList, action => {
      permissions[action] = this.can(this.entity, action, this.resource);
    });

    return permissions;
  }

  get isAllowed() {
    let allowed = false;

    for (let action of this.actionsList) {
      if (this.actionsPermissions[action]) {
        if (action !== PolicyActions.VIEW || action !== PolicyActions.INDEX) {
          this.viewOnly = false;
        }

        allowed = true;
        break;
      }
    }

    return allowed;
  }
}
