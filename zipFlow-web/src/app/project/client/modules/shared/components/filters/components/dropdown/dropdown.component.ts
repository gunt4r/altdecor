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
import {getLocalized} from "../../../../../../../../theme/shared/utils/form.utils";

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: DropdownComponent,
      multi: true
    }
  ]
})

export class DropdownComponent implements ControlValueAccessor, OnInit{
  @Input({required: true}) filter!: Filter;
  @Input() singleSelection!: boolean;

  @Output() valueChanged: EventEmitter<void> = new EventEmitter();

  control!: FormControl;
  isOptionsVisible = true;

  constructor(@Inject(Injector) private injector: Injector) {}


  ngOnInit() {
    const formControl = this.injector.get(NgControl);

    this.control = this.injector.get(FormGroupDirective).getControl(formControl as FormControlName);
  }

  isActiveOption(option: any): boolean {
    return this.control.value.find((el: any) => getLocalized(el) === getLocalized(option));
  }

  setValue(value: InputValue): void {
    if(this.control.value.includes(value)) {
      if(this.singleSelection) {
        this.control.setValue([]);
      } else {
        this.control.setValue(this.control.value.filter((el: string) => el !== value));
      }
    } else {
      if(this.singleSelection) {
        this.control.setValue([value]);
      } else {
        this.control.setValue([...this.control.value, value]);
      }
    }

    this.valueChanged.emit();
  }

  toggleOptions(): void {
    this.isOptionsVisible = !this.isOptionsVisible;
  }

  registerOnChange(fn: any): void {
  }

  registerOnTouched(fn: any): void {
  }

  writeValue(obj: any): void {
  }
}
