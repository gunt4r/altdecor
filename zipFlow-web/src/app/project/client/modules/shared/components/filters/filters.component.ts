import {Component, EventEmitter, HostListener, Inject, Input, OnInit, Output, PLATFORM_ID} from '@angular/core';
import {Filter, FilterType} from "../../interfaces/filters.interface";
import {FormType} from "../../helpers/form-controls.helper";
import {NonNullableFormBuilder} from "@angular/forms";
import {debounce} from "../../../../../../theme/shared/utils/debounce.utils";
import {isPlatformBrowser} from "@angular/common";
import {getLocalized} from "../../../../../../theme/shared/utils/form.utils";

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.scss'
})
export class FiltersComponent implements OnInit {
  @Input({required: true}) filters!: Filter[];
  @Input() activeChips: { dbKey: string; option: any; label: string }[] = [];
  // When false, the host page supplies its own button to open the drawer
  // (the products page does this via its mobile toolbar).
  @Input() showMobileTrigger = true;
  @Output() filtersChange = new EventEmitter<any>();
  @Output() filterOpen = new EventEmitter<boolean>();
  @Output() chipRemove = new EventEmitter<{ dbKey: string; option: any; label: string }>();

  isMobile: boolean = false;
  isSideFilterOpen: boolean = false;
  filterType = FilterType;
  form: FormType<{ [key: string]: any }>;
  formValue: any;

  constructor(private fb: NonNullableFormBuilder,
              @Inject(PLATFORM_ID) private platformId: Object) {
    this.form = this.fb.group({});
  }

  @HostListener('window:resize', ['$event'])
  checkScreenSize(event?: any) {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth <= 1024;
    }
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.checkScreenSize();
      this.syncForm();
    }
  }

  ngOnChanges() {
    this.syncForm();
  }

  // Reconcile the form controls with the current filters WITHOUT replacing the
  // FormGroup instance. The child filter controls (e.g. app-dropdown) cache a
  // reference to their FormControl on init; recreating the FormGroup here would
  // leave them pointing at an orphaned control, so their selections would never
  // reach the form read in submit(). Keeping the same instance avoids that.
  private syncForm(): void {
    const keys = this.filters.map(f => f.db_key);

    Object.keys(this.form.controls).forEach(key => {
      if (!keys.includes(key)) {
        this.form.removeControl(key, {emitEvent: false});
      }
    });

    this.filters.forEach(({db_key, value}) => {
      const control = this.form.get(db_key);
      if (control) {
        control.setValue(value, {emitEvent: false});
      } else {
        this.form.addControl(db_key, this.fb.control(value), {emitEvent: false});
      }
    });

    if (this.formValue) {
      this.form.patchValue(this.formValue, {emitEvent: false});
    }
  }

  // Remove a single selected option (used by the active filter chips).
  removeValue(dbKey: string, option: any): void {
    // The same category can live in several product_type groups, so remove the
    // option from every array control that holds it (not just dbKey); otherwise
    // the chip reappears from the other group on the next rebuild.
    for (const name in this.form.controls) {
      const control = this.form.get(name);
      if (!control) continue;
      const current = control.value;
      if (Array.isArray(current)) {
        const next = current.filter((el: any) => getLocalized(el) !== getLocalized(option));
        if (next.length !== current.length) control.setValue(next);
      } else if (name === dbKey) {
        control.setValue(typeof current === 'string' ? null : []);
      }
    }
    this.submit();
  }

  // Keep filter child components (their expanded "show more" / open state) stable
  // across the frequent filter-list rebuilds — without this the *ngFor recreates
  // each app-dropdown on every change, collapsing "Afișează încă N".
  trackByDbKey(_index: number, filter: Filter): string {
    return filter.db_key;
  }

  toggleSideFilter(): void {
    this.isSideFilterOpen = !this.isSideFilterOpen;

    // if (!this.isSideFilterOpen) {
    //   setTimeout(() => {
    //     this.filterOpen.emit(this.isSideFilterOpen);
    //   }, 500)
    // } else {
      this.filterOpen.emit(this.isSideFilterOpen);
    // }
  }

  submit(key?: any) {
    let filters = this.form.getRawValue();
    this.formValue = filters;

    if (key) {
      const productType = filters[key];
      for (const name in this.form.controls) {
        const controlValue = this.form.get(name)?.value;
        this.form.get(name)?.setValue(typeof controlValue === 'string' ? null : []);
      }

      this.form.get(key)?.setValue(productType);
      filters = this.form.getRawValue();
      this.formValue = filters;
      this.filtersChange.emit(filters);
    }

    // Apply the filter live. On mobile, keep the side panel open so the user can
    // select several filters in a row — it only closes via the close (X) button.
    // On desktop the side panel isn't rendered, so this is a no-op there.
    if (!this.isMobile) {
      this.isSideFilterOpen = false;
      this.filterOpen.emit(this.isSideFilterOpen);
    }

    this.filtersChange.emit(filters);
  }
}
