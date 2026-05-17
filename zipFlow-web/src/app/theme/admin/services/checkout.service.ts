import {Injectable} from '@angular/core';
import {CrudService} from './crud.service';
import {CheckoutRepository} from "../repositories/checkout.repository";
import {CheckoutInterface, CheckoutListResponse} from "../interfaces/checkout.interface";

@Injectable({
  providedIn: 'root'
})
export class CheckoutService extends CrudService<CheckoutInterface, CheckoutListResponse> {
  constructor(protected override repository: CheckoutRepository) {
    super(repository);
  }
}
