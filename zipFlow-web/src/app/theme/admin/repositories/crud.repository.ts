import _ from 'lodash';
import {HttpParams} from '@angular/common/http';
import {lastValueFrom} from 'rxjs';
import {CrudOperationsInterface} from "../interfaces/crud-operations.interface";
import {HttpGateway} from "../helpers/http.gateway";
import {environment} from "../../../../environments/environment";

export abstract class CrudRepository<T, U> implements CrudOperationsInterface<T, U> {
  apiUrl = 'api/' + this.resourceUrl;

  protected constructor(
    protected gateway: HttpGateway,
    protected resourceUrl: string
  ) { }

  public getList(filter?: any): Promise<U> {
    const params = this.makeParams(filter);
    return lastValueFrom(this.gateway.get<U>(this.apiUrl, {params}));
  }

  public getModel(id: string): Promise<T> {
    return lastValueFrom(this.gateway.get<T>(`${this.apiUrl}/${encodeURIComponent(id)}`));
  }

  public create(data: T): Promise<T> {
    return lastValueFrom(this.gateway.post<T>(this.apiUrl, data));
  }

  public update(id: string, data: T): Promise<T> {
    return lastValueFrom(this.gateway.put<T>(`${this.apiUrl}/${encodeURIComponent(id)}`, data));
  }

  public destroy(id: string): Promise<T> {
    return lastValueFrom(this.gateway.delete<T>(`${this.apiUrl}/${encodeURIComponent(id)}`));
  }

  protected makeParams(filter?: any): HttpParams {
    let params = new HttpParams();
    _.each(filter, (value, property) => {
      if (value) {
        params = params.append(property, value);
      }
    });

    return params;
  }
}
