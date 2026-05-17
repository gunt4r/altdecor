import {AbstractControl, FormControl, FormGroup} from "@angular/forms";

export type FormControls<T> = {
  [K in keyof T]: FormType<T[K]>
}

export type FormType<T> = [T] extends [(infer U)[]] ? FormArrayType<U>
  : [T] extends [Date]
    ? FormControl<T>
    : [T] extends [Record<any, any>]
      ? FormGroup<{ [k in keyof T]: FormType<T[k]> }>
      : FormControl<T>;

export type FormArrayType<T> = AbstractControl<Partial<T>[], T[]>;
