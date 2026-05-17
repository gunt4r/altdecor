import {Component, Inject, Injector, PLATFORM_ID} from '@angular/core';
import {AbstractListingComponent} from "../../../core/abstract/abstract-listing.component";
import {Entities} from "../../../../dictionary/permissions.dictionary";
import {LanguageService} from "../../../../services/language.service";

@Component({
  selector: 'app-entities-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent extends AbstractListingComponent {
  override columns = [
    {name: 'Label', key: 'label', sortable: true},
    {name: 'Key', key: 'key', sortable: true},
    {name: 'Is Active', key: 'active', type: 'toggle'}
  ];

  constructor(
    protected override service: LanguageService,
    protected override injector: Injector,
    @Inject(PLATFORM_ID) protected override platformId: Object
  ) {
    super(service, injector, platformId);
  }

  get entity() {
    return Entities.LANGUAGE;
  }

  get routeUrl() {
    return '/admin/languages';
  }

  protected override get resourceName() {
    return 'language';
  }
}
