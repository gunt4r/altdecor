import {Store} from '@ngrx/store';
import {MemoizedSelector} from '@ngrx/store/src/selector';
import {take} from 'rxjs/operators';
import {HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import _ from 'lodash';
import {lastValueFrom} from 'rxjs';
import {selectHeaders} from "../store/selectors/user.selectors";
import {environment} from "../../../../environments/environment";
import {anyObj} from "../interfaces/shared.types.interface";

export type MixinConstructor<T> = new (...args: any[]) => T;

export function getStoreValue(store: Store, selector: MemoizedSelector<any, any>): Promise<any> {
  return lastValueFrom(store.select(selector).pipe(take(1)));
}

export function getErrorMessage(apiError: HttpErrorResponse | any): string {
  if (apiError instanceof HttpErrorResponse && apiError?.error?.errors) {
    const {error} = apiError;

    const messages: Array<string> = [];
    _.each(error.errors, (item: any) => {
      let message = `${_.capitalize(item.message)} on field ${item.field}.`;
      if (item.args && item.args.choices) {
        message += ' Choices: ' + item.args.choices.join(', ');
      }

      messages.push(message);
    });

    return messages.join('|');
  }

  return apiError.message;
}

export async function getRequestHeaders(store: Store): Promise<HttpHeaders> {
  const storeHeaders: any = await getStoreValue(store, selectHeaders);

  return new HttpHeaders({
    ...(environment.secretKey && {'Authorization': `Basic ${environment.secretKey}`}) as anyObj | null
  });
}

export function loadScript(url: string | anyObj, attributes: { [key: string]: any } = {}) {
  return new Promise(resolve => {
    const script = document.createElement('script');

    if (typeof url === 'object') {
      attributes = _.omit(url, ['url']);
      url = url['url'];
    }

    script.setAttribute('src', url as string);

    attributes = Object.assign({
      async: true,
      type : 'text/javascript'
    }, attributes);

    for (const attribute in attributes) {
      if (!attributes.hasOwnProperty(attribute)) {
        continue;
      }

      script.setAttribute(attribute, attributes[attribute]);
    }

    script.onload = resolve;

    document.head.appendChild(script);
  });
}

export function getStringWords(value: string | null): string {
  return value ? value.replace(/([A-Z])/g, ' $1')
    .replace(/^./,  (str) => {
      return str.toUpperCase();
    }) : '';
}
