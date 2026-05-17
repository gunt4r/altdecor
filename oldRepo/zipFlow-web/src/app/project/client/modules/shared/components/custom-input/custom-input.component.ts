import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {InputType, InputValue, RadioOption} from "./custom-input.dictionary";
import {
  ControlValueAccessor,
  FormControl,
  FormControlName,
  FormGroupDirective,
  NG_VALUE_ACCESSOR,
  NgControl
} from "@angular/forms";
import {isPlatformBrowser} from "@angular/common";

@Component({
  selector: 'app-custom-input',
  templateUrl: './custom-input.component.html',
  styleUrl: './custom-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: CustomInputComponent,
      multi: true
    }
  ]
})
export class CustomInputComponent implements ControlValueAccessor, OnInit {
  @Input() type: InputType = InputType.Text;
  @Input() label!: string | null;

  @Input() radioOptions!: RadioOption[];
  @Input() errors!: Record<string, string>;

  inputType = InputType;

  value!: InputValue;
  control!: FormControl;
  onChange!: (value: InputValue) => void;
  onTouched!: () => void;

  constructor(@Inject(Injector) private injector: Injector, @Inject(PLATFORM_ID) private platformId: Object) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const formControl = this.injector.get(NgControl);

      this.control = this.injector.get(FormGroupDirective).getControl(formControl as FormControlName);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  writeValue(obj: InputValue): void {
    this.value = obj;
  }

  setValue(value: InputValue): void {
    this.value = value;
    this.onChange(value);
    this.onTouched();
  }

  getValue(event: any): void {
    this.setValue(event.target.value)
  }

  getCheckboxValue(event: any): void {
    this.setValue(event.target.checked)
  }

  getRadioValue(value: string): void {
    this.setValue(value);
  }
}
