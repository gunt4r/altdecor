import {Component, DestroyRef, Inject, Injector, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {Subscription} from "rxjs";
import {QueryParamsService} from "../../../../services/query-params.service";
import {faCopy} from '@fortawesome/free-regular-svg-icons';
import {faTrash} from '@fortawesome/free-solid-svg-icons';
import {FileService} from "../../../../services/file.service";
import {AbstractListingComponent} from "../../../core/abstract/abstract-listing.component";
import {getErrorMessage} from "../../../../helpers/main.utils";
import {FileSnippet} from "../../../../interfaces/file-snippet.interface";
import {ToastrService} from "ngx-toastr";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {isPlatformBrowser} from "@angular/common";

@Component({
  selector: 'app-images-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent extends AbstractListingComponent implements OnInit, OnDestroy {
  configs: { title: string, button: string } = {
    title: 'Images',
    button: 'Upload'
  }
  perPageOptions = [10, 25, 50, 100];
  faCopy = faCopy;
  faTrash = faTrash;
  subscriptions: Subscription[] = [];
  sharedDirectory: string = 'shared';
  entities: string[] = [this.sharedDirectory];
  activeEntity: string = this.sharedDirectory;
  imagesList: Map<string, FileSnippet[]> = new Map<string, FileSnippet[]>();

  constructor(
    protected override service: FileService,
    protected override injector: Injector,
    private qpService: QueryParamsService,
    private toastr: ToastrService,
    private destroy: DestroyRef,
    @Inject(PLATFORM_ID) protected override platformId: Object
  ) {
    super(service, injector, platformId);
  }

  override async ngOnInit() {
    super.ngOnInit();

    if (isPlatformBrowser(this.platformId)) {
      try {
        const {data, meta} = await this.service.getList({
          page: this.pageNr,
          rowsPerPage: this.rowsPerPage,
          query: this.queryParams.query || '',
          sortBy: this.queryParams.sortBy || '',
          sortOrder: this.queryParams.sortOrder || ''
        });

        this.list = data;
        this.splitImages();
        this.totalRows = meta.total;
      } catch (error) {
        this.toastrService.error(getErrorMessage(error));
      }

      this.subscriptions.push(this.qpService.getParamSubs('page').subscribe((selectedPage: string) => {
        if (selectedPage) {
          this.pageNr = Number(selectedPage);
        }
      }));

      this.subscriptions.push(this.qpService.getParamSubs('rowsPerPage').subscribe((perPage: string) => {
        if (perPage) {
          this.pageNr = Number(perPage);
        }
      }));
    }
  }

  get entity(): string {
    return "";
  }

  get routeUrl(): string {
    return "";
  }

  async onPageSelected(event: any) {
    this.pageNr = event;
    if (this.pageNr) {
      await this.qpService.updateParam('page', this.pageNr);
    }

    this.splitImages();
  }

  async onPerPageSelected() {
    if (this.rowsPerPage) {
      await this.qpService.updateParam('rowsPerPage', this.rowsPerPage);
    }

    this.splitImages();
  }

  copyImage() {
    this.toastr.success(`Copied to clipboard`);
  }

  processFile(event: any) {
    if (!event.target) return;

    const files = event?.target?.files as File[];

    if (!files) return;

    for (let file of files) {
      const reader: FileReader = new FileReader();
      reader.onloadend = () => this.imageLoad(file);
      reader.readAsDataURL(file);
    }
  }

  private imageLoad(file: File) {
    this.service.uploadFile(file, this.activeEntity).pipe(takeUntilDestroyed(this.destroy)).subscribe((res) => {
      (this.list as FileSnippet[]).push(res);
      this.splitImages();

    });
  }


  removeImage(imageId: FileSnippet['id']) {
    this.list = (this.list as FileSnippet[]).filter(({id}) => imageId !== id);
    this.splitImages();

    this.service.destroy(String(imageId)).then();
  }

  setActiveEntity(entity: string) {
    if (!this.entities.includes(entity)) return;

    this.activeEntity = entity;
  }

  private splitImages() {
    if (this.imagesList) this.imagesList.clear();

    this.list?.forEach((file: FileSnippet) => {
      const directory = this.getDirectory(file.file_name);
      if (!this.entities.includes(directory)) this.entities.push(directory);

      const files: FileSnippet[] = this.imagesList?.get(directory) || [];
      files.push(file);
      this.imagesList?.set(directory, files);
    })
  }

  private getDirectory(fileUrl: FileSnippet['file_name']) {
    return fileUrl.split('/')[0] || this.sharedDirectory;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subs => {
      subs.unsubscribe();
    });
  }
}
