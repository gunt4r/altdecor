import { Routes } from '@angular/router';
import { LanguageRedirectComponent } from './language-redirect.component';
import { languageMatcher } from './language.matcher';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: LanguageRedirectComponent
  },
  {
    matcher: languageMatcher,
    loadChildren: () => import('./project/project.module').then((m) => m.ProjectModule)
  },
  {
    path: '**',
    component: LanguageRedirectComponent
  }
];
