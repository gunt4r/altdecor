export enum InputType {
  Text = 'text',
  Email = 'email',
  Password = 'password',
  Checkbox = 'checkbox',
  Phone = 'phone',
  Radio = 'radio'
}

export interface RadioOption<T = string> {
  active: boolean;
  value: T;
  label: string;
}

export type InputValue<T = boolean | string> = T;
