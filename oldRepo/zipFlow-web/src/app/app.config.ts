import {ApplicationConfig} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideClientHydration} from '@angular/platform-browser';
import {provideAnimations} from '@angular/platform-browser/animations';
import {provideHttpClient, withFetch, withInterceptors} from "@angular/common/http";
import {apiInterceptor} from "./theme/admin/interceptors/api.interceptor";
import {loaderInterceptor} from "./theme/admin/interceptors/loader.interceptor";
import {LoaderService} from "./theme/admin/services/loader.service";

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideClientHydration(), provideAnimations(), provideHttpClient(withFetch(), withInterceptors([apiInterceptor, loaderInterceptor(new LoaderService)]))]
};
