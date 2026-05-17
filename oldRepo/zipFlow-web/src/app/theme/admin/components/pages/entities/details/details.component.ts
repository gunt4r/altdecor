import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {DataTypesInterface} from "../../../../interfaces/category.interface";
import {Subject} from "rxjs";
import {EntityService} from "../../../../services/entity.service";
import {ActivatedRoute} from "@angular/router";
import {Entities, PolicyActions} from "../../../../dictionary/permissions.dictionary";
import {DataTypes, FilterTypes} from "../../../../dictionary/data-types.dictionary";
import {isPlatformBrowser} from "@angular/common";

@Component({
  selector: 'app--entity-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  public dataTypes: DataTypesInterface[] = DataTypes;
  public filterTypes: DataTypesInterface[] = FilterTypes;

  public formData: any = [];

  public modelId: string | null = this.route.snapshot.paramMap.get('entityId');

  submitFormSubject: Subject<void> = new Subject<void>();

  submitButtonDisabled = true;

  public currentModel: any;

  entitiesType: DataTypesInterface[] = [];

  constructor(
    public service: EntityService,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
  }

  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.currentModel = await this.getModel();

      const entities = await this.service.getCrudList();
      this.entitiesType = entities.map(el => ({
        value: `api/crud/${el.slug}`,
        key: `ENTITY ${el.label}`
      }));

      this.dataTypes = [
        ...this.dataTypes,
        ...this.entitiesType
      ]

      this.getFormData();
    }
  }

  public async getModel() {
    if (this.modelId) {
      return await this.service.getModel(this.modelId);
    }

    return null
  }

  public getFormData() {
    this.formData = [
      ...this.formData,
      {
        ...this.getObjectKeys('main_details', 'row'),
        controls: [
          this.getDynamicControl('label', 'input', 'Label', 'Label', true, 'col-md-6'),
          this.getDynamicControl('slug', 'input', 'Slug', 'Slug', true, 'col-md-6', null, {disabled: !!this.currentModel}),
          this.getDynamicControl('active', 'toggle', 'Is active', 'Is active', false, 'col-md-2'),
          this.getDynamicControl('has_meta', 'toggle', 'Has meta', 'Has meta', false, 'col-md-2'),
          this.getDynamicControl('public_entity_post', 'toggle', 'Is public POST', 'Is public POST', false, 'col-md-2'),
          this.getDynamicControl('public_entity_get', 'toggle', 'Is public GET', 'Is public GET', false, 'col-md-2'),
          this.getDynamicControl('avoid_translate', 'toggle', 'Avoid Translate', 'Avoid Translate', false, 'col-md-2'),
        ]
      },
      (this.currentModel ? this.getNestedControls(this.currentModel, 'keys', true) : {
        ...this.getObjectKeys('keys', 'row', true),
        controls: [
          [
            this.getDynamicControl('key', 'input', 'Key', 'Key', true, 'col-md-4'),
            this.getDynamicControl('type', 'dropdown', 'Type', 'Type', true, 'col-md-4', {
              data: this.dataTypes,
              key: 'key',
              value: 'value'
            }),
            this.getDynamicControl('optional', 'toggle', 'Optional', 'Optional', false, 'col-md-2'),
            this.getDynamicControl('avoid_translate', 'toggle', 'Avoid Translate', 'Avoid Translate', false, 'col-md-2')
          ]
        ]
      }),
      this.getDynamicControl('has_main_controls', 'toggle', 'Has main controls', 'Has main controls', false, 'col-md-2'),
      ((this.currentModel && this.currentModel['has_main_controls']) && this.getNestedControls(this.currentModel, 'main_controls', true)),
      this.getDynamicControl('has_filters', 'toggle', 'Has filters', 'Has filters', false, 'col-md-2'),
      ((this.currentModel && this.currentModel['has_filters']) && this.getNestedControls(this.currentModel, 'filter_keys', true)),
    ].filter(el => el);
  }

  getNestedControls(model: any, key: string, isArray: boolean = false): any {
    return {
      ...this.getObjectKeys(key, 'row', isArray, key === 'array_keys'),
      controls: key === 'filter_keys' ? [
        ...model[key].map((el: any) => (
          [
            this.getDynamicControl('db_key', 'input', 'DB Key', 'DB Key', true, 'col-md-3'),
            this.getDynamicControl('label', 'input', 'Label', 'Label', true, 'col-md-3'),
            this.getDynamicControl('filter_type', 'dropdown', 'Filter Type', 'Filter Type', false, 'col-md-3', {
              data: this.filterTypes,
              key: 'key',
              value: 'value'
            }),
            this.getDynamicControl('entity', 'dropdown', 'Entity', 'Entity', false, 'col-md-3', {
              data: this.entitiesType,
              key: 'key',
              value: 'value'
            })
          ].filter(el => el)
        ))
      ] : key === 'main_controls' ? [
        ...(model?.[key] || [{}]).map((el: any) => (
          [
            this.getDynamicControl('path', 'input', 'Path', 'Path', true, 'col-md-4'),
            this.getDynamicControl('label', 'input', 'Label', 'Label', true, 'col-md-4'),
            this.getDynamicControl('order', 'number', 'Order', 'Order', true, 'col-md-2')
          ].filter(el => el)
        ))
      ] : (key !== 'array_keys' ? [
        ...model[key].map((el: any) => (
          [
            this.getDynamicControl('key', 'input', 'Key', 'Key', true, 'col-md-4'),
            this.getDynamicControl('type', 'dropdown', 'Type', 'Type', true, 'col-md-4', {
              data: this.dataTypes,
              key: 'key',
              value: 'value'
            }),
            this.getDynamicControl('optional', 'toggle', 'Optional', 'Optional', false, 'col-md-1'),
            this.getDynamicControl('avoid_translate', 'toggle', 'Avoid Translate', 'Avoid Translate', false, 'col-md-2'),
            (el['object_keys'] && this.getNestedControls(el, 'object_keys', true)),
            (el['array_keys'] && this.getNestedControls(el, 'array_keys', true))
          ].filter(el => el)
        ))
      ] : [
        ...model[key].map((el: any) => (
          [
            this.getNestedControls(el, 'object_keys', true)
          ]
        ))
      ])
    }
  }

  public controlChange(event: { event: { control: FormControl, key: string, groupKey: string }, index?: number }) {
    if (event.event.key === 'type') {
      let groupControl: any = this.getControlFromKey(event.event.groupKey.split(`.${event.index}.type`)[0]);
      if (groupControl?.controls && typeof event.index === 'number') {
        switch (event.event.control.value) {
          case 'object':
            groupControl.controls[event.index] = [
              ...groupControl.controls[event.index].filter((el: any) => el.key !== 'array_keys'),
              {
                ...this.getObjectKeys('object_keys', 'row', true),
                controls: [
                  [
                    this.getDynamicControl('key', 'input', 'Key', 'Key', true, 'col-md-4'),
                    this.getDynamicControl('type', 'dropdown', 'Type', 'Type', true, 'col-md-4', {
                      data: this.dataTypes,
                      key: 'key',
                      value: 'value'
                    }),
                    this.getDynamicControl('optional', 'toggle', 'Optional', 'Optional', false, 'col-md-1'),
                    this.getDynamicControl('avoid_translate', 'toggle', 'Avoid Translate', 'Avoid Translate', false, 'col-md-2')
                  ]
                ]
              }
            ];
            break;
          case 'array':
            groupControl.controls[event.index] = [
              ...groupControl.controls[event.index].filter((el: any) => el.key !== 'object_keys'),
              {
                ...this.getObjectKeys('array_keys', 'row', true),
                controls: [
                  [
                    {
                      ...this.getObjectKeys('object_keys', 'row', true),
                      controls: [
                        [
                          this.getDynamicControl('key', 'input', 'Key', 'Key', true, 'col-md-4'),
                          this.getDynamicControl('type', 'dropdown', 'Type', 'Type', true, 'col-md-4', {
                            data: this.dataTypes,
                            key: 'key',
                            value: 'value'
                          }),
                          this.getDynamicControl('optional', 'toggle', 'Optional', 'Optional', false, 'col-md-1'),
                          this.getDynamicControl('avoid_translate', 'toggle', 'Avoid Translate', 'Avoid Translate', false, 'col-md-2')
                        ]
                      ]
                    }
                  ]
                ]
              }
            ];
            break;
          default:
            groupControl.controls[event.index] = groupControl.controls[event.index].filter((el: any) => el.key !== 'array_keys' && el.key !== 'object_keys');
        }

        // change pointer in order to trigger input event
        this.formData = [...this.formData];
      }
    } else if (event.event.key === 'has_filters') {
      if (event.event.control?.value) {
        const spliceIndex = this.formData.findIndex((el: any) => el.key === 'has_filters') + 1;
        this.formData.splice(spliceIndex, 0, {
          ...this.getObjectKeys('filter_keys', 'row', true),
          controls: [
            [
              this.getDynamicControl('db_key', 'input', 'DB key', 'DB key', false, 'col-md-3'),
              this.getDynamicControl('label', 'input', 'Label', 'Label', false, 'col-md-3'),
              this.getDynamicControl('filter_type', 'dropdown', 'Filter Type', 'Filter Type', false, 'col-md-3', {
                data: this.filterTypes,
                key: 'key',
                value: 'value'
              }),
              this.getDynamicControl('entity', 'dropdown', 'Entity', 'Entity', false, 'col-md-3', {
                data: this.entitiesType,
                key: 'key',
                value: 'value'
              })
            ]
          ]
        });
      } else {
        this.formData = this.formData.filter((el: any) => el.key !== 'filter_keys');
      }

      // change pointer in order to trigger input event
      this.formData = [...this.formData];
    } else if (event.event.key === 'has_main_controls') {
      if (event.event.control?.value) {
        const spliceIndex = this.formData.findIndex((el: any) => el.key === 'has_main_controls') + 1;
        this.formData.splice(spliceIndex, 0, {
          ...this.getObjectKeys('main_controls', 'row', true),
          controls: [
            [
              this.getDynamicControl('path', 'input', 'Path', 'Path', true, 'col-md-4'),
              this.getDynamicControl('label', 'input', 'Label', 'Label', true, 'col-md-4'),
              this.getDynamicControl('order', 'number', 'Order', 'Order', true, 'col-md-2')
            ]
          ]
        });
      } else {
        this.formData = this.formData.filter((el: any) => el.key !== 'main_controls');
      }

      // change pointer in order to trigger input event
      this.formData = [...this.formData];
    }
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

  getDynamicControl(key: string, type: string, label: string, placeholder: string, required: boolean, className: string, config?: any, mainProps?: any): any {
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

  getObjectKeys(key: string, className: string, isArray = false, hideActions = false) {
    return {
      key,
      isArray,
      className,
      hideActions,
      controls: []
    }
  }

  importEntity(event: any) {
    const f = event.target.files[0];
    const reader = new FileReader();

    reader.onload = ((theFile) => {
      return (e: any) => {
        try {
          this.formData = [];
          this.currentModel = JSON.parse(e.target.result);

          this.getFormData();
        } catch (ex) {
          alert('exception when trying to parse json = ' + ex);
        }
      };
    })(f);
    reader.readAsText(f);
  }

  public get entities(): typeof Entities {
    return Entities;
  }

  get policyActions() {
    return PolicyActions;
  }
}
