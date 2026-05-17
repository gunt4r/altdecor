import {DataTypesInterface} from "../interfaces/category.interface";

export const DataTypes: DataTypesInterface[] = [
  {
    value: 'input',
    key: 'Text'
  },
  {
    value: 'number',
    key: 'Number'
  },
  {
    value: 'toggle',
    key: 'Toggle'
  },
  {
    value: 'editor',
    key: 'HTML'
  },
  {
    value: 'image',
    key: 'Image'
  },
  {
    value: 'file',
    key: 'File'
  },
  {
    value: 'object',
    key: 'Object'
  },
  {
    value: 'array',
    key: 'Array'
  }
]

export const FilterTypes: DataTypesInterface[] = [
  {
    value: 'radio',
    key: 'Radio'
  },
  {
    value: 'checkbox',
    key: 'Checkbox'
  },
  {
    value: 'dropdown',
    key: 'Dropdown'
  }
]
