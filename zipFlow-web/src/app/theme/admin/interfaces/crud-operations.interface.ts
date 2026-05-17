export interface CrudOperationsInterface<T, U> {
  getList(qp: any): Promise<U>;

  getModel(id: string): Promise<T>;

  create(data: T): Promise<T>;

  update(id: string, data: T): Promise<T>;

  destroy(id: string): Promise<any>;
}
