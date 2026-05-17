import {Injectable} from '@angular/core';
import {CrudRepository} from "./crud.repository";
import {HttpGateway} from "../helpers/http.gateway";
import {
  EmailSendInterface,
  EmailTemplateInterface,
  EmailTemplateListResponse
} from "../interfaces/email-template.interface";
import {lastValueFrom, Observable} from "rxjs";
import {ApisService} from "../services/apis.service";

@Injectable({
  providedIn: 'root'
})
export class EmailTemplateRepository extends CrudRepository<EmailTemplateInterface, EmailTemplateListResponse> {
  constructor(protected override gateway: HttpGateway, private apis: ApisService) {
    super(gateway, 'email/template');
  }

  public sendEmails(templateId: string, configs?: EmailSendInterface): Promise<any> {
    const params = this.makeParams(configs);
    return lastValueFrom(this.gateway.post(this.apis.sendEmails(templateId), {params}));
  }

  sendEmail(emailData: any): Observable<any> {
    return this.gateway.post(this.apis.email(), emailData);
  }
}

