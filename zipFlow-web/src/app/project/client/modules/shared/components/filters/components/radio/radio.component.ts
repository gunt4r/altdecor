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
import {InputValue} from "../../../custom-input/custom-input.dictionary";

@Component({
  selector: 'app-radio',
  templateUrl: './radio.component.html',
  styleUrl: './radio.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: RadioComponent,
      multi: true
    }
  ]
})

export class RadioComponent implements ControlValueAccessor, OnInit{
  @Input({required: true}) filter!: Filter;

  @Output() valueChanged: EventEmitter<void> = new EventEmitter();

  control!: FormControl;

  constructor(@Inject(Injector) private injector: Injector) {}


  ngOnInit() {
    const formControl = this.injector.get(NgControl);

    this.control = this.injector.get(FormGroupDirective).getControl(formControl as FormControlName);
  }

  setValue(value: InputValue): void {
    if (value === this.control.value) this.control.setValue("");
    else {
      this.control.setValue(value);
    }

    this.valueChanged.emit();
  }

  registerOnChange(fn: any): void {
  }

  registerOnTouched(fn: any): void {
  }

  writeValue(obj: any): void {
  }
}
