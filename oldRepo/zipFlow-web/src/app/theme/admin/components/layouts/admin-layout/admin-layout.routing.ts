import {Routes} from '@angular/router';
import {UnauthorizedComponent} from "../../pages/unauthorized/unauthorized.component";
import {HomeComponent} from "../../pages/home/home.component";

export const AdminLayoutRoutes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: '401',
    component: UnauthorizedComponent
  },
  {
    path: 'entities',
    loadChildren: () => import ('../../pages/entities/entities.module').then(m => m.EntitiesModule),
  },
  {
    path: 'languages',
    loadChildren: () => import ('../../pages/languages/languages.module').then(m => m.LanguagesModule),
  },
  {
    path: 'images',
    loadChildren: () => import ('../../pages/images/images.module').then(m => m.ImagesModule),
  },
  {
    path: 'email-sender',
    loadChildren: () => import ('../../pages/emails/emails.module').then(m => m.EmailsModule),
  },
  {
    path: 'analytics',
    loadChildren: () => import ('../../pages/analytics/analytics.module').then(m => m.AnalyticsModule),
  },
  {
    path: 'checkout',
    loadChildren: () => import ('../../pages/checkout/checkout.module').then(m => m.CheckoutModule),
  },
  {
    path: 'crud/:entitySlug',
    loadChildren: () => import ('../../pages/crud/crud.module').then(m => m.CrudModule),
  }
];
