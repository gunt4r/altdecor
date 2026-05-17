import {Component, DestroyRef, Inject, PLATFORM_ID} from '@angular/core';
import {NonNullableFormBuilder, ValidationErrors, Validators} from "@angular/forms";
import {FormControls, FormType} from "../../../../shared/helpers/form-controls.helper";
import {ConsultForm} from "./consult.dictionary";
import {PublicService} from "../../../../shared/services/public.service";
import {phoneNumberValidator} from "../../../../shared/validators/phone.validator";
import {EmailTemplateService} from "../../../../../../../theme/admin/services/email-template.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {isPlatformBrowser} from "@angular/common";

@Component({
  selector: 'app-consult',
  templateUrl: './consult.component.html',
  styleUrl: './consult.component.scss'
})
export class ConsultComponent {
  form!: FormType<ConsultForm>;

  constructor(private fb: NonNullableFormBuilder,
              private publicService: PublicService,
              private emailService: EmailTemplateService,
              private destroy: DestroyRef,
              @Inject(PLATFORM_ID) private platformId: Object) {

    this.form = this.fb.group<FormControls<ConsultForm>>({
      phone_number: this.fb.control('',
        [Validators.required.bind(Validators),
          Validators.minLength(5),
          phoneNumberValidator().bind(this)])
    })
  }

  // Logic for not showing 2 errors at the same time
  getPhoneErrors(): ValidationErrors | null {
    const phoneControl = this.form?.get('phone_number');
    if (phoneControl?.errors?.['required'] && !phoneControl.value.trim()) {
      return {required: true};
    }
    if (phoneControl?.errors?.['invalidPhoneNumber'] && phoneControl.value) {
      return {invalidPhoneNumber: true};
    }
    if (phoneControl?.errors?.['minlength'] && phoneControl.value) {
      return {minlength: true};
    }
    return null;
  }


  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.publicService.addPhoneNumber(this.form.getRawValue()).pipe(takeUntilDestroyed(this.destroy)).subscribe(() => {
      this.emailService.sendEmail({
        subject: "Număr de telefon înregistrat",
        template: `S-a înregistrat un nou număr de telefon pe platformă <a href="tel:${this.form.getRawValue().phone_number}">${this.form.getRawValue().phone_number}</a>`
      }).pipe(takeUntilDestroyed(this.destroy)).subscribe();
      this.form.reset();
    });
  }
}
