export enum FilterType {
  Single = 'single',
  Dropdown = 'dropdown',
  Checkbox = 'checkbox',
  Radio = 'radio'
}

export interface Filter {
  filter_type: FilterType,
  db_key: string;
  label: string,
  options?: any[],
  value?: any
}
