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
  showAll = false;
  readonly visibleLimit = 5;

  constructor(@Inject(Injector) private injector: Injector) {}


  ngOnInit() {
    const formControl = this.injector.get(NgControl);

    this.control = this.injector.get(FormGroupDirective).getControl(formControl as FormControlName);

    // Collapsed by default; auto-expand groups that already have a selection.
    this.isOptionsVisible = Array.isArray(this.control.value) && this.control.value.length > 0;
  }

  get visibleOptions(): any[] {
    const options = this.filter.options || [];
    return this.showAll ? options : options.slice(0, this.visibleLimit);
  }

  get hiddenCount(): number {
    return Math.max(0, (this.filter.options?.length || 0) - this.visibleLimit);
  }

  isActiveOption(option: any): boolean {
    return this.control.value.find((el: any) => getLocalized(el) === getLocalized(option));
  }

  setValue(value: InputValue): void {
    // Compare by localized value, NOT reference: the filter list is deep-cloned
    // on every change (products.component), so an option object clicked now is a
    // different reference from the one already stored in the control. Using
    // reference equality here made unchecking impossible (it re-added instead of
    // removing) — mirror isActiveOption's value comparison instead.
    const isSelected = this.control.value.some((el: any) => getLocalized(el) === getLocalized(value));

    if (isSelected) {
      if (this.singleSelection) {
        this.control.setValue([]);
      } else {
        this.control.setValue(this.control.value.filter((el: any) => getLocalized(el) !== getLocalized(value)));
      }
    } else {
      if (this.singleSelection) {
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
