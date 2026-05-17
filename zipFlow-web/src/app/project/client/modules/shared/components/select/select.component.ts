import {Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewEncapsulation} from '@angular/core';
import {SelectOption, SelectType} from "./select.type";

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class SelectComponent {
  @Input() options!: SelectOption[];
  @Input() type: SelectType = SelectType.Outlined;
  @Output() optionSelected = new EventEmitter<unknown>();

  @Input() selectedOption!: string;
  isOptionsVisible = false;

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOptionsVisible = false;
    }
  }

  toggleOptions(): void {
    this.isOptionsVisible = !this.isOptionsVisible;
  }
  onSelectChange(option: SelectOption): void {
    this.selectedOption = option.label;
    this.isOptionsVisible = false;
    this.optionSelected.emit(option.value);
  }
}
