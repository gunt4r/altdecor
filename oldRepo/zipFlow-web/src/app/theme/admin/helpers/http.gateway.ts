import {Inject, Injectable, Injector, PLATFORM_ID} from '@angular/core';
import {HttpClient, HttpHandler, HttpHeaders, HttpParams, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';

interface IHttpOptions {
  body?: any;
  headers?: HttpHeaders | {
    [header: string]: string | string[];
  };
  params?: HttpParams | {
    [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>;
  };
  reportProgress?: boolean;
  responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
}

@Injectable({
  providedIn: 'root'
})
export class HttpGateway extends HttpClient {
  constructor(
    handler: HttpHandler,
    private injector: Injector,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    super(handler);
  }

  override request(first: string | HttpRequest<any>, url?: string, options: IHttpOptions = {}): Observable<any> {
    // ensures headers properties are not null
    if (!options) {
      options = {};
    }

    if (!options.headers) {
      options.headers = new HttpHeaders();
    }

    if (typeof first !== 'string' && !first.headers) {
      first = (first as HttpRequest<any>).clone({headers: new HttpHeaders()});
    }

    return super.request(first as (any), url as any, options);
  }
}
