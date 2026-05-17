import {Injectable} from '@angular/core';
import {CrudRepository} from "./crud.repository";
import {HttpGateway} from "../helpers/http.gateway";
import {LanguageInterface, LanguageListResponse} from "../interfaces/language.interface";

@Injectable({
  providedIn: 'root'
})
export class LanguageRepository extends CrudRepository<LanguageInterface, LanguageListResponse> {
  constructor(protected override gateway: HttpGateway) {
    super(gateway, 'languages');
  }
}

