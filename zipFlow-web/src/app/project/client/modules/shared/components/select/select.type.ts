export interface SelectOption<T = unknown> {
  label: string,
  value: T;
}


export enum SelectType {
  Default = 'default',
  Outlined = 'outlined'
}
