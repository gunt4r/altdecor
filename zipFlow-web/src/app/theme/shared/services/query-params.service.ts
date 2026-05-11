import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class QueryParamsService {
  getParamValue(key: string): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    return new URLSearchParams(window.location.search).get(key);
  }
}
