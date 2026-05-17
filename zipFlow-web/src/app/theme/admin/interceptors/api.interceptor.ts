import {HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import {lastValueFrom, Observable} from 'rxjs';
import {environment} from "../../../../environments/environment";
import {AUTH_LOCAL_TOKEN_KEY} from "../../auth/auth.constants";

export const apiInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  return new Observable<HttpEvent<unknown>>(observer => {
    handle(req, next).then(
      (event: HttpEvent<unknown>) => {
        observer.next(event);
        observer.complete();
      },
      (error: any) => observer.error(error)
    );
  });
};

async function handle(req: HttpRequest<unknown>, next: HttpHandlerFn): Promise<HttpEvent<unknown>> {
  const token = localStorage.getItem(AUTH_LOCAL_TOKEN_KEY);
  let clonedReq: HttpRequest<unknown>;

  const apiUrl = environment.apiUrl;

  if (!req.url) {
    throw new Error('Request URL is empty');
  }

  const isSvg = req.url.includes('.svg');
  const isFile = req.url.includes('files');
  const isApi = req.url.includes('api/');
  const isStorage = req.url.includes('storage.google');

  const headers: { [name: string]: string | string[] } = {};

  if (token && !isStorage) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (isApi && !isFile && !isStorage) {
    headers['Content-Type'] = 'application/json';
  }

  const urlPrefix = isSvg ? '/' : apiUrl;

  clonedReq = req.clone({
    setHeaders: headers,
    url: isStorage ? req.url : `${urlPrefix}${req.url}`
  });

  return lastValueFrom(next(clonedReq));
}
