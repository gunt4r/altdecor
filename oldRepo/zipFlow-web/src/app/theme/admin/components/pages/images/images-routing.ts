import {Routes} from '@angular/router';
import {ListComponent} from "./list/list.component";

export const ImagesRoutes: Routes = [
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
  }
];
