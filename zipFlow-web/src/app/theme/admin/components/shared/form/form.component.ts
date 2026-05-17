import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID
} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {AbstractComponent} from "../../core/abstract/abstract.component";
import {anyObj} from "../../../interfaces/shared.types.interface";
import {Store} from "@ngrx/store";
import {PermissionsService} from "../../../services/permissions.service";
import {Observable} from "rxjs";
import {getErrorMessage} from "../../../helpers/main.utils";
import {debounce} from "../../../../shared/utils/debounce.utils";
import {isPlatformBrowser} from "@angular/common";

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})

export class FormComponent extends AbstractComponent implements OnInit, OnDestroy {
  public formGroup: any;

  public formConfig: any = [];

  public formSubmitted = false;

  private formSubscriptions: any = [];

  public images: any = {};

  model: any;

  @Input() name: string = '';
  @Input() entity: string = '';
  @Input() urlSegment: string = '';
  @Input() modelId: string | null = null;
  @Input() service: any;
  // @ts-ignore
  @Input() submitForm: Observable<void>;
  @Input() language: string = 'ro';

  @Input() set setFormConfig(values: any) {
    this.setConfig(values);
  }

  @Input() set setModel(model: any) {
    this.model = model;

    this.getModel();
  }

  @Output() submitButtonState = new EventEmitter(true);
  @Output() formChange = new EventEmitter();
  @Output() controlChange = new EventEmitter();
  @Output() addArrayItemEvent = new EventEmitter();
  @Output() removeArrayItemEvent = new EventEmitter();

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private toastrService: ToastrService,
    protected override store: Store,
    protected override permissionsService: PermissionsService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) protected override platformId: Object
  ) {
    super(store, permissionsService, platformId);
  }

  async ngOnInit() {
    if(isPlatformBrowser(this.platformId)) {
      this.formSubscriptions.push(this.submitForm.subscribe(async () => {
        // this.submitButtonState.emit(true);
        await this.saveModel();
      }));
    }
  }

  @debounce(100)
  setConfig(values: any) {
    if (values?.length) {
      this.formConfig = values;
      let config = {};
      let defaultFormValue: any;

      if (this.formGroup?.value) {
        defaultFormValue = this.formGroup.getRawValue();
        this.formGroup = new FormGroup({});
      }

      config = this.createNestedForm(values, config);

      this.formGroup = this.formBuilder.group(config);

      if (defaultFormValue) {
        // set last value for form group
        this.formGroup.patchValue(defaultFormValue);
      }
    }
  }

  createNestedForm(values: any, config: any) {
    values.forEach((value: any) => {
      if (!value?.controls?.length) {
        if (value.key) {
          config[value.key] = [value.mainProps?.value || '', value.validations];
        }
      } else {
        if (value.key) {
          if (value.isArray) {
            config[value.key] = this.formBuilder.array(this.createArrayForm(value));
          } else {
            const nestedConfig: any = {};
            value.controls.forEach((child: any) => {
              if (child.controls?.length) {
                const nestedForm = this.createNestedForm([child], {});
                const formGroup = this.formBuilder.group(nestedForm);

                nestedConfig[child.key] = formGroup?.controls?.[child.key] || formGroup;
              } else {
                nestedConfig[child.key] = [child.mainProps?.value || '', child.validations];
              }
            });

            config[value.key] = this.formBuilder.group(nestedConfig);
          }
        }
      }
    });
    return config;
  }

  public createArrayForm(value: anyObj): anyObj[] {
    const formArray: any = [];
    value['controls'].forEach((child: any) => {
      const nestedConfig: any = {};

      child.forEach((nestedChild: any) => {
        const nestedForm = this.createNestedForm([nestedChild], {});
        nestedConfig[nestedChild.key] = nestedForm[nestedChild.key] || nestedForm;
      })

      formArray.push(this.formBuilder.group(nestedConfig));
    });

    return formArray;
  }

  public reset() {
    this.formGroup.reset();
  }

  public getModel() {
    setTimeout(() => {
      if (this.model && this.formGroup) {
        this.reset();
        this.formGroup.patchValue(this.model);
      }

      this.submitButtonState.emit(false);
      }, 500)
  }

  public async saveModel() {
    this.formSubmitted = true;

    try {
      if (this.formGroup.invalid) {
        return;
      }

      const data = this.getSaveData();

      let segments = this.router.url.split('/');
      let redirectUrl = segments.slice(0, -1).join('/');

      if (this.modelId) {
        await this.service.update(this.modelId, data);
        this.toastrService.success(`${this.name} successfully updated!`);
        await this.router.navigate([redirectUrl]);
      } else {
        await this.service.create(data);
        this.toastrService.success(`${this.name} successfully created!`);
        await this.router.navigate([redirectUrl]);
      }
    } catch (error) {
      this.toastrService.error(getErrorMessage(error));
    }
  }

  addArrayItem(controlKey: string) {
    this.addArrayItemEvent.emit(controlKey);
  }

  removeArrayItem(key: string, index: number) {
    this.removeArrayItemEvent.emit({key, index});
    this.formGroup.get(key).removeAt(index);
  }

  protected getSaveData() {
    return {
      ...this.formGroup.getRawValue()
    };
  }

  get isReadOnly() {
    // return !this.can(this.entity as Entities, PolicyActions.UPDATE, this.model);
    return false;
  }

  override ngOnDestroy() {
    this.formSubscriptions.forEach((subscription: any) => subscription.unsubscribe());
  }
}
