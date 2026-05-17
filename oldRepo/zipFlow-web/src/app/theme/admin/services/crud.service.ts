import {CrudOperationsInterface} from "../interfaces/crud-operations.interface";
import {CrudRepository} from "../repositories/crud.repository";


export abstract class CrudService<T, U> implements CrudOperationsInterface<T, U> {
  protected constructor(protected repository: CrudRepository<T, U>) { }

  getList(filter?: any) {
    return this.repository.getList(filter);
  }

  getModel(id: string) {
    return this.repository.getModel(id);
  }

  create(data: T) {
    return this.repository.create(data);
  }

  update(id: string, data: T) {
    return this.repository.update(id, data);
  }

  destroy(id: string) {
    return this.repository.destroy(id);
  }
}
