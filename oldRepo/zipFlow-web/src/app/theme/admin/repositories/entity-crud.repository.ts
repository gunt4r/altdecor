import {Injectable} from '@angular/core';
import {CrudRepository} from "./crud.repository";
import {HttpGateway} from "../helpers/http.gateway";
import {EntityCrudInterface, EntityCrudListResponse} from "../interfaces/entity-crud.interface";
import {Router} from "@angular/router";
import {lastValueFrom} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class EntityCrudRepository extends CrudRepository<EntityCrudInterface, EntityCrudListResponse> {
  constructor(protected override gateway: HttpGateway, private router: Router) {
    super(gateway, 'crud');
  }

  public override getList(filter?: any): Promise<EntityCrudListResponse> {
    const params = this.makeParams(filter);
    return lastValueFrom(this.gateway.get<EntityCrudListResponse>(this.getApiUrl(), {params}));
  }

  public override getModel(id: string): Promise<EntityCrudInterface> {
    return lastValueFrom(this.gateway.get<EntityCrudInterface>(`${this.getApiUrl()}/${encodeURIComponent(id)}`));
  }

  public override create(data: EntityCrudInterface): Promise<EntityCrudInterface> {
    return lastValueFrom(this.gateway.post<EntityCrudInterface>(this.getApiUrl(), data));
  }

  public override update(id: string, data: EntityCrudInterface): Promise<EntityCrudInterface> {
    return lastValueFrom(this.gateway.put<EntityCrudInterface>(`${this.getApiUrl()}/${encodeURIComponent(id)}`, data));
  }

  public override destroy(id: string): Promise<EntityCrudInterface> {
    return lastValueFrom(this.gateway.delete<EntityCrudInterface>(`${this.getApiUrl()}/${encodeURIComponent(id)}`));
  }

  getApiUrl() {
    const slug = this.router.url.split('/crud/')[1]?.split('/')[0]?.split('?')[0];
    return 'api/' + 'crud' + `${slug ? ('/' + slug) : ''}`;
  }
}

