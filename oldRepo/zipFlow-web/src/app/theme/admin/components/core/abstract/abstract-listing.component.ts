import {Component, Inject, Injector, OnInit, PLATFORM_ID} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {anyObj} from "../../../interfaces/shared.types.interface";
import {CrudService} from "../../../services/crud.service";
import {ToastrService} from "ngx-toastr";
import {ConfirmationDialogService} from "../../../services/confirmation-dialog.service";
import {getErrorMessage} from "../../../helpers/main.utils";
import {isPlatformBrowser} from "@angular/common";
import {SortTypes} from "../../../../client/utils/api-params.utils";

@Component({
  template: ''
})
export abstract class AbstractListingComponent implements OnInit {
  isLoading = true;

  totalRows = 0;
  pageNr: number = 1;
  rowsPerPage: number = 10;
  list: Array<any> | null = [];
  queryParams: any;
  columns: Array<anyObj> = [];

  protected constructor(
    protected service: CrudService<any, any>,
    protected injector: Injector,
    @Inject(PLATFORM_ID) protected platformId: Object
  ) {
  }

  abstract get entity(): string;

  abstract get routeUrl(): string;

  public get toastrService(): ToastrService {
    return this.injector.get(ToastrService);
  }

  private get confirmationDialogService(): ConfirmationDialogService {
    return this.injector.get(ConfirmationDialogService);
  }

  private get router(): Router {
    return this.injector.get(Router);
  }

  public get route(): ActivatedRoute {
    return this.injector.get(ActivatedRoute);
  }

  protected get resourceName() {
    return 'resource';
  }

  protected get labelName() {
    return '';
  }

  protected get deleteMessage() {
    return 'Resource successfully removed!';
  }

  protected deleteQuestion() {
    return `Do you really want to remove this ${this.resourceName} ${this.labelName}?`;
  }

  public get createUrl() {
    return `${this.routeUrl}/create`;
  }

  public ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.route.queryParams.subscribe(async (params) => {
          await this.getInitialData(params);
        }
      );
    }
  }

  async getInitialData(params?: any) {
    if (params) {
      this.queryParams = params;
      if (params['page']) {
        this.pageNr = params['page'];
      }

      if (params['rowsPerPage']) {
        this.rowsPerPage = Number(params['rowsPerPage']);
      }
    }

    await this.getList();
  }

  public async getList() {
    this.isLoading = true;

    try {
      const {data, meta} = await this.service.getList({
        page: this.pageNr,
        rowsPerPage: this.rowsPerPage,
        query: this.queryParams.query || '',
        sortBy: this.queryParams.sortBy || 'created_at',
        sortOrder: this.queryParams.sortOrder || SortTypes.ASC
      });

      this.list = data;
      this.totalRows = meta.total;
    } catch (error) {
      this.toastrService.error(getErrorMessage(error));
    }

    this.isLoading = false;
  }

  public async onTableRowAction(event: any) {
    switch (event.type) {
      case 'remove':
        this.confirmationDialogService.confirm(`Remove ${this.resourceName}`, this.deleteQuestion())
          .then(async (confirmed) => {
            if (confirmed && event.row.id) {
              await this.service.destroy(event.row.id);
              this.toastrService.success(this.deleteMessage);
              await this.getList();
            }
          })
          .catch((error) => {
            const errorMessage = getErrorMessage(error);
            if (errorMessage) {
              this.toastrService.error(errorMessage);
            }
          });
        break;
      case 'edit':
        await this.router.navigate([this.routeUrl, event.row.id]);
        break;
    }
  }
}
