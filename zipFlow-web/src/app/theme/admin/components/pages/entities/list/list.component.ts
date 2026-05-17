import {Component, Inject, Injector, PLATFORM_ID} from '@angular/core';
import {AbstractListingComponent} from "../../../core/abstract/abstract-listing.component";
import {EntityService} from "../../../../services/entity.service";
import {Entities, PolicyActions} from "../../../../dictionary/permissions.dictionary";

@Component({
  selector   : 'app-entities-list',
  templateUrl: './list.component.html',
  styleUrls  : ['./list.component.scss']
})
export class ListComponent extends AbstractListingComponent {
  override columns = [
    {name: 'Label', key: 'main_details.label', sortable: true},
    {name: 'Slug', key: 'main_details.slug', sortable: true},
    {name: 'Active', key: 'main_details.active', type: 'toggle', sortable: false}
  ];

  constructor(
    protected override service: EntityService,
    protected override injector: Injector,
    @Inject(PLATFORM_ID) protected override platformId: Object
  ) {
    super(service, injector, platformId);
  }

  get entity() {
    return Entities.ENTITY;
  }

  get routeUrl() {
    return '/admin/entities';
  }

  get policyActions() {
    return PolicyActions;
  }

  protected override get resourceName() {
    return 'entity';
  }
}
