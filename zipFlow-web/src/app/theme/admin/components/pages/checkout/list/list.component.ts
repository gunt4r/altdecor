import {Component, Inject, Injector, PLATFORM_ID} from '@angular/core';
import {AbstractListingComponent} from "../../../core/abstract/abstract-listing.component";
import {Entities} from "../../../../dictionary/permissions.dictionary";
import {CheckoutService} from "../../../../services/checkout.service";

@Component({
  selector: 'app-checkout-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent extends AbstractListingComponent {
  override columns = [
    {name: 'Name', key: 'details.name', sortable: true},
    {name: 'Surname', key: 'details.surname', sortable: true},
    {name: 'Phone number', key: 'details.phone', sortable: true},
    {name: 'Created At', key: 'createdAt', type: 'date', sortable: true},
  ];

  constructor(
    protected override service: CheckoutService,
    protected override injector: Injector,
    @Inject(PLATFORM_ID) protected override platformId: Object
  ) {
    super(service, injector, platformId);
  }

  get entity() {
    return Entities.Checkout;
  }

  get routeUrl() {
    return '/admin/checkout';
  }

  protected override get resourceName() {
    return 'checkout';
  }
}
