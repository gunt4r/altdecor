import {Injectable} from '@angular/core';
import {CrudRepository} from "./crud.repository";
import {HttpGateway} from "../helpers/http.gateway";
import {FilesListResponse} from "../interfaces/file-snippet.interface";

@Injectable({
  providedIn: 'root'
})
export class FilesRepository extends CrudRepository<string, FilesListResponse> {
  constructor(protected override gateway: HttpGateway) {
    super(gateway, 'files');
  }
}

