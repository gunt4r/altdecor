import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {Validators} from '@angular/forms';
import {Subject} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {Entities, PolicyActions} from "../../../../dictionary/permissions.dictionary";
import {EntityCrudService} from "../../../../services/entity-crud.service";
import {EntityService} from "../../../../services/entity.service";
import {map} from "rxjs/operators";
import {PublicService} from "../../../../../../project/client/modules/shared/services/public.service";
import {isPlatformBrowser} from "@angular/common";

@Component({
  selector: 'app--crud-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  public formData: any = [];

  public modelId: string | null = this.route.snapshot.paramMap.get('entityId');
  public entitySlug: string | null = this.route.snapshot.paramMap.get('entitySlug');

  submitFormSubject: Subject<void> = new Subject<void>();

  submitButtonDisabled = true;

  public currentModel: any;
  public config: any;
  public languages: any;

  formLanguage = 'ro';

  avoidTranslateTypes = ['image', 'toggle', 'number'];

  constructor(
    public service: EntityCrudService,
    public entityService: EntityService,
    public publicService: PublicService,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
  }

  ngOnInit() {
    if(isPlatformBrowser(this.platformId)) {
      // Subscribe to the route params (not a one-time snapshot): navigating straight
      // from one record to another (e.g. picking a second global-search result) reuses
      // this component instance, so we must reload on every param change.
      this.route.paramMap.subscribe(async (params) => {
        this.modelId = params.get('entityId');
        this.entitySlug = params.get('entitySlug');
        await this.load();
      });
    }
  }

  private async load() {
    this.config = await this.getConfig();
    this.currentModel = await this.getModel();
    this.publicService.getLanguages().subscribe(res => {
      this.languages = res.data;

      if (!this.languages?.length) {
        this.languages = [{label: 'Romanian', key: this.formLanguage}]
      }

      // create form if config exists
      if (this.config) {
        this.getFormData();
      }
    })
  }

  public async getModel() {
    if (this.modelId) {
      return await this.service.getModel(this.modelId);
    }

    return null
  }

  public async getConfig() {
    if (this.entitySlug) {
      return await this.entityService.getCrudBySlug(this.entitySlug);
    }

    return null
  }

  public getFormData() {
    if (this.config) {
      this.formData = [
        {
          ...this.getObjectKeys('data', 'row', true, true),
          controls: [
            ...this.config['keys'].map((el: any) => ([
              this.getNestedControls(el)
            ])),
            (this.config['main_details']['has_meta'] && [{
              ...this.getObjectKeys('meta', 'row', true, true, 'Meta Tags'),
              controls: this.getMetaControls()
            }])
          ].filter(el => el)
        },
      ];

      if (this.currentModel?.data?.length) {
        this.currentModel.data.forEach((model: any, index: number) => {
          this.addArrayItems(model, 'data', index);
        })
      }
    }
  }

  getMetaControls() {
    return [
      [
        this.getDynamicControl('title', 'input', 'Title', 'Title', false, 'col-md-12'),
        this.getDynamicControl('keywords', 'input', 'Key Words', 'Key Words', false, 'col-md-12'),
        this.getDynamicControl('description', 'textarea', 'Description', 'Description', false, 'col-md-12'),
        this.getDynamicControl('copyright', 'input', 'Copyright', 'Copyright', false, 'col-md-12'),
        this.getDynamicControl('image', 'image', 'Image', 'Image', false, 'col-md-12')
      ]
    ];
  }

  addArrayItems(model: any, key: string, pathIndex: number) {
    Object.keys(model).forEach((el, index) => {
      // detect array type
      if (model[el] && typeof model[el] === 'object' && model[el]?.length) {
        // detect additional array items
        const newKey = `${key}.${pathIndex || 0}.${el}`;

        if (model[el]?.length > 1) {
          model[el].forEach((arrayItem: any, index: number) => {
            if (index > 0) {
              this.addArrayItem(newKey);
            }
          })
        } else {
          this.addArrayItems(model[el][0], newKey, 0);
        }
      }
    })
  }

  getNestedControls(model: any, keyPath: string = ''): any {
    return model['array_keys'] || model['object_keys'] ? {
      ...this.getObjectKeys(model.key, 'row', !!model['array_keys'] || !!model['object_keys'], !!model['object_keys']),
      controls: [
        (model['array_keys']?.[0]?.['object_keys'] || model['object_keys']).map((el: any) => {
          if (!el['object_keys'] && !el['array_keys']) {
            return {
              ...this.getDynamicControl(el.key, el.type, `${keyPath} ${model.key} ${el.key}`.toUpperCase(), '', !el.optional, `col-md-12 ${model['array_keys'] ? 'pl-0' : ''}`, null, null, el['avoid_translate']),
            }
          } else {
            return {
              ...this.getNestedControls(el, `${keyPath} ${model.key}`)
            }
          }
        })
      ]
    } : this.getDynamicControl(model.key, model.type, model.key.toUpperCase(), '', !model.optional, 'col-md-12', null, null, model['avoid_translate'])
  }

  public addArrayItem(controlKey: string) {
    let control: any = this.getControlFromKey(controlKey);

    if (control?.controls) {
      control.controls = [
        ...control.controls,
        this.getDefaultControls(control.controls[0])
      ];
    }

    // change pointer in order to trigger input event
    this.formData = [...this.formData];
  }

  public removeArrayItem(event: any) {
    let control: any = this.getControlFromKey(event.key);

    if (control?.controls) {
      control.controls = control.controls.filter((el: any, index: number) => index !== event.index);
    }

    // change pointer in order to trigger input event
    this.formData = [...this.formData];
  }

  getControlFromKey(key: string) {
    let control: any;
    const keySegments = key.split('.');

    keySegments.forEach((segment: string, index: number) => {
      if (!control && !index) {
        control = this.formData.find((el: any) => el.key === segment);
      } else if (control?.controls?.length) {
        control = control.controls.find((el: any, controlIndex: number) => el.key === segment || controlIndex === Number(segment));
      } else if (control.length) {
        control = control.find((el: any) => el.key === segment);
      }
    });
    return control;
  }

  getDefaultControls(control: any) {
    if (control.length) {
      return control.map((el: any) => this.getDefaultControls(el));
    }
    if (!control.controls?.length) {
      return control;
    } else {
      if (control.isArray) {
        return {
          ...control,
          controls: [control.controls[0].map((el: any) => this.getDefaultControls(el))]
        }
      } else {
        return {
          ...control,
          controls: control.controls.map((el: any) => this.getDefaultControls(el))
        }
      }
    }
  }

  getDynamicControl(key: string, type: string, label: string, placeholder: string, required: boolean, className: string, config?: any, mainProps?: any, avoidTranslate?: boolean): any {
    if (this.avoidTranslateTypes.find(el => el === type) || this.config?.main_details?.avoid_translate || avoidTranslate) {
      // detect entity type
      if (type.includes('/')) {
        return {
          key,
          config: {
            data: this.entityService.getCrud(type + '?page=1&rowsPerPage=1000').pipe(map((res: any) => {
              return res?.data?.map((el: any) => ({
                value: {...el.data[0], id: el.id},
                key: el.data[0][Object.keys(el.data[0])[0]]['ro'] || el.data[0][Object.keys(el.data[0])[0]]
              })) || []
            })),
            key: 'name',
            value: 'id'
          },
          mainProps,
          type: 'multiselect',
          className,
          label,
          placeholder,
          validations: required ? [Validators.required] : [],
        }
      } else {
        return {
          key,
          mainProps,
          config,
          type,
          className,
          label,
          placeholder,
          validations: required ? [Validators.required] : [],
        }
      }
    } else {
      return {
        ...this.getObjectKeys(key, 'row'),
        controls: this.languages.map((language: any) => ({
          showByLanguage: true,
          key: language.key,
          mainProps,
          config,
          type,
          className,
          label,
          placeholder,
          validations: required ? [Validators.required] : [],
        }))
      }
    }
  }

  getObjectKeys(key: string, className: string, isArray = false, hideActions = false, label = '') {
    return {
      key,
      isArray,
      className,
      label,
      hideActions,
      controls: []
    }
  }

  setActiveLanguage(key: string) {
    this.formLanguage = key;
  }

  public get entities(): typeof Entities {
    return Entities;
  }

  get policyActions() {
    return PolicyActions;
  }
}
