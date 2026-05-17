import {CanActivateFn, Router} from '@angular/router';
import {Page} from "../admin/interfaces/page.interface";
import {inject} from "@angular/core";
import {AuthService} from "../admin/services/auth.service";
import {map} from "rxjs/operators";

export const isAuthenticatedGuard: CanActivateFn = () => {
  const router: Router = inject(Router);

  return inject(AuthService).isAuthenticated().pipe(
    map((authenticated) => {
      if (authenticated) return true;

      void router.navigate([`${Page.Auth}/${Page.Login}`]);
      return false;
    })
  );
};

export const isNotAuthenticatedGuard: CanActivateFn = () => {
  const router: Router = inject(Router);

  return inject(AuthService).isAuthenticated().pipe(
    map((authenticated) => {
      if (!authenticated) return true;

      void router.navigate([Page.Admin]);
      return false;
    })
  );
};
