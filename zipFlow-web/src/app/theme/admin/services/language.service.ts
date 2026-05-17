import {Injectable} from '@angular/core';
import {CrudService} from './crud.service';
import {LanguageInterface, LanguageListResponse} from "../interfaces/language.interface";
import {LanguageRepository} from "../repositories/language.repository";

@Injectable({
  providedIn: 'root'
})
export class LanguageService extends CrudService<LanguageInterface, LanguageListResponse> {
  constructor(protected override repository: LanguageRepository) {
    super(repository);
  }
}
