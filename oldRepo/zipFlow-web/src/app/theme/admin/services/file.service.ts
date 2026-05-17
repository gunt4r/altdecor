import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ApisService} from "./apis.service";
import {FilesListResponse, FileSnippet} from "../interfaces/file-snippet.interface";
import {CrudService} from "./crud.service";
import {FilesRepository} from "../repositories/files.repository";

@Injectable({
  providedIn: 'root'
})
export class FileService extends CrudService<string, FilesListResponse> {

  constructor(protected override repository: FilesRepository, private http: HttpClient, private apis: ApisService) {
    super(repository);
  }

  uploadFile(file: File, directory?: string): Observable<FileSnippet> {
    const formData = new FormData();

    formData.append('file', file);

    if (directory) formData.append('directory', directory);

    return this.http.post<FileSnippet>(this.apis.filesUpload(), formData);
  }
}
