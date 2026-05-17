import {Injectable} from '@angular/core';
import {CrudRepository} from "./crud.repository";
import {EntityCrudListResponse, EntityInterface, EntityListResponse} from "../interfaces/entity.interface";
import {HttpGateway} from "../helpers/http.gateway";
import {lastValueFrom, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class EntityRepository extends CrudRepository<EntityInterface, EntityListResponse> {
  constructor(protected override gateway: HttpGateway) {
    super(gateway, 'entities');
  }

  public getCrudList(): Promise<EntityCrudListResponse[]> {
    return lastValueFrom(this.gateway.get<EntityCrudListResponse[]>('api/entities/crud'));
  }

  public getCrudBySlug(slug: string): Promise<EntityInterface> {
    return lastValueFrom(this.gateway.get<EntityInterface>(`api/entities/slug/${slug}`));
  }

  public getCrud(path: string): Observable<any> {
    return this.gateway.get<any>(path);
  }
}

