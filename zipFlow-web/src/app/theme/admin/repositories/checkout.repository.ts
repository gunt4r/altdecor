import {Injectable} from '@angular/core';
import {CrudRepository} from "./crud.repository";
import {HttpGateway} from "../helpers/http.gateway";
import {CheckoutInterface, CheckoutListResponse} from "../interfaces/checkout.interface";

@Injectable({
  providedIn: 'root'
})
export class CheckoutRepository extends CrudRepository<CheckoutInterface, CheckoutListResponse> {
  constructor(protected override gateway: HttpGateway) {
    super(gateway, 'checkout');
  }
}

