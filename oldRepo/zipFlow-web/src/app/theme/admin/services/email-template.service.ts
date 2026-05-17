import {Injectable} from '@angular/core';
import {CrudService} from './crud.service';
import {
  EmailSendInterface,
  EmailTemplateInterface,
  EmailTemplateListResponse
} from "../interfaces/email-template.interface";
import {EmailTemplateRepository} from "../repositories/email-template.repository";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class EmailTemplateService extends CrudService<EmailTemplateInterface, EmailTemplateListResponse> {
  constructor(protected override repository: EmailTemplateRepository) {
    super(repository);
  }

  sendEmails(templateId: string, data?: EmailSendInterface) {
    return this.repository.sendEmails(templateId, data);
  }

  sendEmail(emailData: any): Observable<any> {
    return this.repository.sendEmail(emailData);
  }
}
