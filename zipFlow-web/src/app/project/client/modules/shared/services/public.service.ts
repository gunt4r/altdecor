import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {AnalyticsInterface} from "../../../../../theme/admin/interfaces/analytics.interface";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PublicService {
  constructor(private http: HttpClient) {
  }

  addPhoneNumber(phone_number: any) {
    return this.http.post<any>('api/public/crud/phone', {data: [phone_number]});
  }

  addEmail(email: any) {
    return this.http.post<any>('api/public/crud/email', {data: [email]});
  }

  getLanguages() {
    return this.http.get<any>('api/public/languages');
  }

  getAnalytics(): Observable<any> {
    return this.http.get<any>('api/public/analytics');
  }

  getAdvantages() {
    return this.http.get<any>('api/public/crud/advantages');
  }

  getProductTypes(params?: any) {
    if(params) {
      return this.http.get<any>('api/public/crud/product_type', { params });
    } else {
      return this.http.get<any>('api/public/crud/product_type');
    }
  }

  getBlogCategories() {
    return this.http.get<any>('api/public/crud/blog_category');
  }

  getBlogFilterLabels() {
    return this.http.get<any>('api/public/crud/blogs/filter-labels?labels=blog_category');
  }

  getProductCategories(params?: any) {
    const merged = {sortBy: 'position', sortOrder: 'ASC', ...(params || {})};
    return this.http.get<any>('api/public/crud/product_categories', {params: merged});
  }

  getProductsSlider() {
    return this.http.get<any>('api/public/crud/products_slider');
  }

  getCategoriesBanner() {
    return this.http.get<any>('api/public/crud/categories_banner');
  }

  getProducts(params: any) {
    return this.http.get<any>('api/public/crud/product', {params});
  }

  getProductById(id: string | null) {
    return this.http.get<any>(`api/public/crud/product/${id}`);
  }

  getProductsFilterLabels() {
    return this.http.get<any>('api/public/crud/product/filter-labels?labels=product_type,product_category,configurations,material,characteristic');
  }

  getEntertainmentSlider() {
    return this.http.get<any>('api/public/crud/entertainment_slider');
  }

  getFAQ() {
    return this.http.get<any>('api/public/crud/faq');
  }

  getAboutUs() {
    return this.http.get<any>('api/public/crud/about_us');
  }

  getPortfolio() {
    return this.http.get<any>('api/public/crud/portfolio');
  }

  getGeneralDetails() {
    return this.http.get<any>('api/public/crud/general_details');
  }

  downloadPdf(url: string) {
    return this.http.get(url, { responseType: 'blob' });
  }

  getInteriorDiv() {
    return this.http.get<any>('api/public/crud/interior_divisions');
  }

  getBlogs(params: any) {
    return this.http.get<any>('api/public/crud/blogs', {params});
  }

  getBlogById(id: string | null) {
    return this.http.get<any>(`api/public/crud/blogs/${id}`);
  }

  getMeta(params: any) {
    return this.http.get<any>('api/public/crud/meta', {params});
  }

  getSiteConfig(params?: any) {
    return this.http.get<any>('api/public/crud/site_config', {params});
  }

  getAddresses(params?: any) {
    return this.http.get<any>('api/public/crud/address', {params});
  }
}
