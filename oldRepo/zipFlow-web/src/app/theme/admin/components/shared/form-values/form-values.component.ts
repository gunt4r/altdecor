import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-form-values',
  templateUrl: './form-values.component.html',
  styleUrl: './form-values.component.scss'
})
export class FormValuesComponent {
  @Input() data!: any;
  @Input() excludeKeys: string[] = ['id', 'password'];

  objectKeys(obj: any) {
    return Object.keys(obj).map((key) => ({
      key: key,
      value: obj[key],
    }));
  }

  isObject(value: any) {
    return typeof value === 'object' && value !== null;
  }
}
