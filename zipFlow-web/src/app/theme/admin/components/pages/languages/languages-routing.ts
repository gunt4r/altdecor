import {Routes} from '@angular/router';
import {ListComponent} from "./list/list.component";
import {DetailsComponent} from "./details/details.component";

export const LanguagesRoutes: Routes = [
  {
    path       : '',
    component  : ListComponent,
    // canActivate: [PermissionsGuard],
    // data       : {
    //   policy: {
    //     entity: Entities.ENTITY,
    //     action: PolicyActions.INDEX
    //   }
    // }
  },
  {
    path       : 'create',
    component  : DetailsComponent,
    // canActivate: [PermissionsGuard],
    // data       : {
    //   policy: {
    //     entity: Entities.ENTITY,
    //     action: PolicyActions.CREATE
    //   }
    // }
  },
  {
    path       : ':languageId',
    component  : DetailsComponent,
    // canActivate: [PermissionsGuard],
    // data       : {
    //   policy: {
    //     entity: Entities.ENTITY,
    //     action: PolicyActions.VIEW
    //   }
    // }
  }
];
