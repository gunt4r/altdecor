import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {Validators} from '@angular/forms';
import {Subject} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {Entities, PolicyActions} from "../../../../dictionary/permissions.dictionary";
import {AnalyticsService} from "../../../../services/analytics.service";
import {isPlatformBrowser} from "@angular/common";

@Component({
  selector: 'app-analytics-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  public formData: any = [];

  public modelId: string | null = this.route.snapshot.paramMap.get('analyticsId');

  submitFormSubject: Subject<void> = new Subject<void>();

  submitButtonDisabled = true;

  public currentModel: any;

  constructor(
    public service: AnalyticsService,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
  }

  async ngOnInit() {
    if(isPlatformBrowser(this.platformId)) {
      this.currentModel = await this.getModel();
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
      this.getDynamicControl('title', 'input', 'Title', 'Title', false, 'col-md-6'),
      this.getDynamicControl('type', 'input', 'Type', 'Type', true, 'col-md-6'),
      this.getDynamicControl('token', 'input', 'Token', 'Token', true, 'col-md-6'),
      this.getDynamicControl('active', 'toggle', 'Is Active', 'Is Active', false, 'col-md-6')
    ];
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

  public get entities(): typeof Entities {
    return Entities;
  }

  get policyActions() {
    return PolicyActions;
  }
}
