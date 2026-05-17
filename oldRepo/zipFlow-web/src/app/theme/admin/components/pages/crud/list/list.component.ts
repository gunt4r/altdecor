import {Component, Inject, Injector, PLATFORM_ID} from '@angular/core';
import {AbstractListingComponent} from "../../../core/abstract/abstract-listing.component";
import {Entities, PolicyActions} from "../../../../dictionary/permissions.dictionary";
import {EntityCrudService} from "../../../../services/entity-crud.service";
import {EntityService} from "../../../../services/entity.service";
import {getErrorMessage} from "../../../../helpers/main.utils";
import {ConfirmationDialogService} from "../../../../services/confirmation-dialog.service";
import {EntityCrudInterface} from "../../../../interfaces/entity-crud.interface";
import {isPlatformBrowser} from "@angular/common";

@Component({
  selector: 'app-crud- list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent extends AbstractListingComponent {
  public entitySlug: string | null = this.route.snapshot.paramMap.get('entitySlug');
  private label!: string;
  language = localStorage.getItem('language') || 'ro';

  override columns: any = [];
  defaultColumns: any = [
    {name: 'ID', key: 'id', sortable: true},
    {name: 'Created At', key: 'created_at', type: 'date', sortable: true},
    {name: 'Updated At', key: 'updated_at', type: 'date', sortable: true}
  ];

  constructor(
    protected override service: EntityCrudService,
    protected override injector: Injector,
    private entityService: EntityService,
    @Inject(PLATFORM_ID) protected override platformId: Object
  ) {
    super(service, injector, platformId);
  }

  override async ngOnInit() {
    super.ngOnInit();
    if(isPlatformBrowser(this.platformId)) {
      this.route.paramMap.subscribe(async (params) => {
        await this.getInitialData(params);
        this.entitySlug = this.route.snapshot.paramMap.get('entitySlug');
        const config: any = await this.getConfig();
        this.label = config['main_details']['label'];

        if (config?.['main_controls']?.length) {
          this.columns = [...this.defaultColumns];

          this.columns.splice(1, 0, ...this.sortByKey(config?.['main_controls'].map((el: any) => ({
            name: el.label,
            key: el.path.split('.')?.length == 1 ? ('data.0.' + el.path + (!config?.['main_details']?.['avoid_translate'] ? ('.' + this.language) : '')) : el.path
          })), 'order'))
        }
      })
    }
  }

  public async getConfig() {
    if (this.entitySlug) {
      return await this.entityService.getCrudBySlug(this.entitySlug);
    }

    return null
  }

  // TODO add later in util
  sortByKey(array: any, key: string) {
    return array.sort((a: any, b: any) => {
      if (a[key] < b[key]) return -1;
      if (a[key] > b[key]) return 1;
      return 0;
    });
  }

  get entity() {
    return Entities.CRUD;
  }

  get policyActions() {
    return PolicyActions;
  }

  get routeUrl() {
    return '/admin/crud/' + this.entitySlug;
  }

  protected override get labelName() {
    return `${this.label}`
  }

  protected override get resourceName() {
    return 'crud';
  }

  protected get cloneRowMessage() {
    return 'Do you wanna clone this row?';
  }

  protected get rowClonedMessage() {
    return 'Row cloned successfully!';
  }

  cloneRow({data}: any) {
    this.confirmationDialog.confirm("Clone row", this.cloneRowMessage)
      .then(async (confirmed) => {
        if (confirmed) {
          await this.service.create({data});
          await this.getList();
          this.toastrService.success(this.rowClonedMessage);
        }
      })
      .catch((error) => {
        const errorMessage = getErrorMessage(error);
        if (errorMessage) {
          this.toastrService.error(errorMessage);
        }
      });
  }

  private get confirmationDialog(): ConfirmationDialogService {
    return this.injector.get(ConfirmationDialogService);
  }
}
