import {Component, Inject, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Entities, PolicyActions} from "../../../../dictionary/permissions.dictionary";
import {CheckoutService} from "../../../../services/checkout.service";
import {isPlatformBrowser} from "@angular/common";

@Component({
  selector: 'app-checkout-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  public formData: any = [];

  public modelId: string | null = this.route.snapshot.paramMap.get('checkoutId');

  public currentModel: any;

  constructor(
    public service: CheckoutService,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
  }

  async ngOnInit() {
    if(isPlatformBrowser(this.platformId)) {
      this.currentModel = await this.getModel();
    }
  }

  public async getModel() {
    if (this.modelId) {
      return await this.service.getModel(this.modelId);
    }

    return null
  }

  public get entities(): typeof Entities {
    return Entities;
  }

  get policyActions() {
    return PolicyActions;
  }
}
