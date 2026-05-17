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
  selector: 'app-single-filter',
  templateUrl: './single-filter.component.html',
  styleUrl: './single-filter.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SingleFilterComponent,
      multi: true
    }
  ]
})

export class SingleFilterComponent implements ControlValueAccessor, OnInit {
  @Input({required: true}) filter!: Filter;
  @Output() valueChanged: EventEmitter<void> = new EventEmitter();

  control!: FormControl;

  isActive = false;

  constructor(@Inject(Injector) private injector: Injector) {
  }


  ngOnInit() {
    const formControl = this.injector.get(NgControl);

    this.control = this.injector.get(FormGroupDirective).getControl(formControl as FormControlName);
    this.isActive = this.control.value;
  }

  setValue(): void {
    this.isActive = !this.isActive;
    this.control.setValue(this.isActive);
    this.valueChanged.emit();
  }

  registerOnChange(fn: any): void {
  }

  registerOnTouched(fn: any): void {
  }

  writeValue(obj: any): void {
  }
}
