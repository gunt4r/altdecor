import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpGateway {
  constructor(private http: HttpClient) {}

  get<T>(path: string): Observable<T> {
    return this.http.get<T>(this.normalize(path));
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(this.normalize(path), body);
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(this.normalize(path), body);
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(this.normalize(path));
  }

  private normalize(path: string): string {
    return `${environment.apiUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  }
}
