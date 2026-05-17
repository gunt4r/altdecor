import {Injectable} from '@angular/core';
import {CrudService} from './crud.service';
import {EntityInterface, EntityListResponse} from "../interfaces/entity.interface";
import {EntityRepository} from "../repositories/entity.repository";

@Injectable({
  providedIn: 'root'
})
export class EntityService extends CrudService<EntityInterface, EntityListResponse> {
  constructor(protected override repository: EntityRepository) {
    super(repository);
  }

  getCrudList() {
    return this.repository.getCrudList();
  }

  getCrudBySlug(slug: string) {
    return this.repository.getCrudBySlug(slug);
  }

  getCrud(path: string) {
    return this.repository.getCrud(path);
  }
}
