import { AbstractControl, ValidatorFn } from '@angular/forms';

export function phoneNumberValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const phoneNumber = control.value;

    if (!phoneNumber) return null;

    if (!/^\+?\d+$/.test(phoneNumber)) {
      return { 'invalidPhoneNumber': true };
    }

    return null;
  };
}
