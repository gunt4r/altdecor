// email.service.ts
import {Injectable} from '@angular/core';
import * as emailjs from 'emailjs-com';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  sendEmail(emailData: any): Promise<any> {
    return emailjs.send(
      'zipFlow_welcome',
      'template_3213rx4',
      emailData
    );
  }
}
