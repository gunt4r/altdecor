import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoaderService } from "../services/loader.service";

export const loaderInterceptor: (loaderService: LoaderService) => HttpInterceptorFn = (loaderService: LoaderService) => {
  return (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
    loaderService.show();

    return next(req).pipe(
      finalize(() => {
        loaderService.hide();
      })
    );
  };
};
