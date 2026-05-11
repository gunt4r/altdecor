import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PublicService {
  constructor(private http: HttpClient) {}

  getProducts(params?: Record<string, any>): Observable<any> {
    return this.get('api/public/crud/products', params);
  }

  getProductTypes(params?: Record<string, any>): Observable<any> {
    return this.get('api/public/crud/product_type', params);
  }

  getProductCategories(params?: Record<string, any>): Observable<any> {
    return this.get('api/public/crud/product_category', params);
  }

  getCategoriesBanner(params?: Record<string, any>): Observable<any> {
    return this.get('api/public/crud/categories_banner', params);
  }

  getGeneralDetails(): Observable<any> {
    return this.get('api/public/crud/general_details', { page: 1, rowsPerPage: 10 });
  }

  getLanguages(): Observable<any> {
    return this.get('api/public/languages');
  }

  getProductsFilterLabels(): Observable<any> {
    return this.get('api/public/crud/product_category/filter-labels', { labels: 'title,image,id' });
  }

  getNavigationConfig(): Observable<any> {
    return this.getSiteConfig({ page: 1, rowsPerPage: 100 });
  }

  getSiteConfig(params?: Record<string, any>): Observable<any> {
    return this.get('api/public/crud/site_config', params);
  }

  getAddresses(params?: Record<string, any>): Observable<any> {
    return this.get('api/public/crud/addresses', params);
  }

  getMeta(params?: Record<string, any>): Observable<any> {
    return this.get('api/public/crud/meta', params);
  }

  private get(path: string, params?: Record<string, any>): Observable<any> {
    return this.http.get(this.normalizeUrl(path), {
      params: this.toHttpParams(params)
    });
  }

  private normalizeUrl(path: string): string {
    return `${environment.apiUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  }

  private toHttpParams(source?: Record<string, any>): HttpParams {
    let params = new HttpParams();
    Object.entries(source || {}).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }
      params = params.set(key, String(value));
    });
    return params;
  }
}
