import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApisService {

  login(): string {
    return `${this.auth()}/login`
  }

  filesUpload(): string {
    return `${this.files()}/upload`;
  }

  file(fileId: number): string {
    return `${this.api()}/files/${fileId}`;
  }

  files(): string {
    return `${this.api()}/files`;
  }

  sendEmails(templateId: string): string {
    return `${this.emailTemplate()}/${templateId}/send`;
  }

  emailTemplate(): string {
    return `${this.email()}/template`;
  }

  email(): string {
    return `${this.api()}/email`;
  }

  private auth(): string {
    return `${this.api()}/auth`;
  }

  private api(): string {
    return 'api';
  }
}
