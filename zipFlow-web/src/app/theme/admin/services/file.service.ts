import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  uploadFile(file: File, _folder: string): Observable<{ file_url: string }> {
    return new Observable((observer) => {
      const reader = new FileReader();
      reader.onload = () => {
        observer.next({ file_url: String(reader.result || '') });
        observer.complete();
      };
      reader.onerror = (error) => observer.error(error);
      reader.readAsDataURL(file);
    });
  }
}
