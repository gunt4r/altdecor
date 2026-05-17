import { Routes } from '@angular/router';
import { languageMatcher } from './project/client/modules/shared/url-matchers/language.matcher';
import { PageSlug } from './project/client/modules/shared/components/page-container/pages.type';

export const routes: Routes = [
  {
    matcher: languageMatcher,
    children: [
      {
        path: '',
        loadChildren: () => import('./project/project.module').then(m => m.ProjectModule),
      },
    ]
  },
  {
    path: '**',
    redirectTo: PageSlug.NotFound
  }
];