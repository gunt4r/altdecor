import {Component, Inject, Injector, PLATFORM_ID} from '@angular/core';
import {AbstractListingComponent} from "../../../core/abstract/abstract-listing.component";
import {Entities} from "../../../../dictionary/permissions.dictionary";
import {AnalyticsService} from "../../../../services/analytics.service";

@Component({
  selector: 'app-analytics-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent extends AbstractListingComponent {
  override columns = [
    {name: 'Title', key: 'title', sortable: true},
    {name: 'Type', key: 'type', sortable: true},
    {name: 'Is Active', key: 'active', type: 'toggle'}
  ];

  constructor(
    protected override service: AnalyticsService,
    protected override injector: Injector,
    @Inject(PLATFORM_ID) protected override platformId: Object
  ) {
    super(service, injector, platformId);
  }

  get entity() {
    return Entities.Analytics;
  }

  get routeUrl() {
    return '/admin/analytics';
  }

  protected override get resourceName() {
    return 'analytics';
  }
}
