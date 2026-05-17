import {Injectable} from '@angular/core';
import {CrudService} from './crud.service';
import {EntityCrudRepository} from "../repositories/entity-crud.repository";
import {EntityCrudInterface, EntityCrudListResponse} from "../interfaces/entity-crud.interface";

@Injectable({
  providedIn: 'root'
})
export class EntityCrudService extends CrudService<EntityCrudInterface, EntityCrudListResponse> {
  constructor(protected override repository: EntityCrudRepository) {
    super(repository);
  }
}
