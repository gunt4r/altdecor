import {Component, EventEmitter, Inject, Injector, Input, OnInit, Output} from '@angular/core';
import {Filter} from "../../../../interfaces/filters.interface";
import {
  ControlValueAccessor,
  FormControl,
  FormControlName,
  FormGroupDirective,
  NG_VALUE_ACCESSOR,
  NgControl
} from "@angular/forms";

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: CheckboxComponent,
      multi: true
    }
  ]
})

export class CheckboxComponent implements ControlValueAccessor, OnInit {
  @Input({required: true}) filter!: Filter;
  @Output() valueChanged: EventEmitter<void> = new EventEmitter();

  control!: FormControl;

  constructor(@Inject(Injector) private injector: Injector) {
  }


  ngOnInit() {
    const formControl = this.injector.get(NgControl);

    this.control = this.injector.get(FormGroupDirective).getControl(formControl as FormControlName);
  }

  isActiveOption(option: any): boolean {
    return this.control.value.find((el: any) => el['ro'] === option['ro']);
  }

  setValue(value: any): void {
    let values = [];
    if (this.control.value instanceof Array) {
      values = this.control.value;
    }

    if (!this.control.value.find((el: any) => el['ro'] === value['ro'])) values.push(value);
    else values = values.filter((item) => item['ro'] !== value['ro']);

    this.control.setValue(values);
    this.valueChanged.emit();
  }

  registerOnChange(fn: any): void {
  }

  registerOnTouched(fn: any): void {
  }

  writeValue(obj: any): void {
  }
}
