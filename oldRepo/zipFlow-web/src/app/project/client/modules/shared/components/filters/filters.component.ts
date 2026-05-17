import {Component, EventEmitter, HostListener, Inject, Input, OnInit, Output, PLATFORM_ID} from '@angular/core';
import {Filter, FilterType} from "../../interfaces/filters.interface";
import {FormType} from "../../helpers/form-controls.helper";
import {FormGroup, NonNullableFormBuilder} from "@angular/forms";
import {debounce} from "../../../../../../theme/shared/utils/debounce.utils";
import {isPlatformBrowser} from "@angular/common";

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.scss'
})
export class FiltersComponent implements OnInit {
  @Input({required: true}) filters!: Filter[];
  @Output() filtersChange = new EventEmitter<any>();
  @Output() filterOpen = new EventEmitter<boolean>();

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
      this.isMobile = window.innerWidth < 1024;
    }
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.checkScreenSize();
      this.filters.forEach(({db_key, value}) => {
        this.form.addControl(db_key, this.fb.control(value));
      })
    }
  }

  ngOnChanges() {
    this.form = new FormGroup<any>({});

    this.filters.forEach(({db_key, value}) => {
      if (this.form.get(db_key)) {
        this.form.get(db_key)?.setValue(value);
      } else {
        this.form.addControl(db_key, this.fb.control(value));
      }
    })

    if (this.formValue) {
      this.form.patchValue(this.formValue);
    }
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

    this.isSideFilterOpen = false;

    this.filterOpen.emit(this.isSideFilterOpen);

    this.filtersChange.emit(filters);
  }
}
