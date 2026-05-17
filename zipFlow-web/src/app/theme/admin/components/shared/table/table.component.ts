import _ from 'lodash';
import moment from 'moment';
import {Component, ContentChild, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef} from '@angular/core';
import {debounceTime, distinctUntilChanged, Subject, Subscription} from "rxjs";
import {Entities, PolicyActions} from "../../../dictionary/permissions.dictionary";
import {faEdit, faTrash} from '@fortawesome/free-solid-svg-icons';
import {Router} from "@angular/router";
import {QueryParamsService} from "../../../services/query-params.service";
import {TableActionsDirective} from "../../directives/table-actions.directive";

@Component({
  selector   : 'app-table',
  templateUrl: './table.component.html',
  styleUrls  : ['./table.component.scss']
})
export class TableComponent implements OnInit, OnDestroy {
  @Input() rows: any;
  @Input() columns: any;
  // @ts-ignore
  @Input() pendingRequest: boolean;
  @Input() canCreate: boolean = true;
  @Input() totalCount: number = 0;
  @Input() perPage: number = 10;
  @Input() selectedPage = 1;
  @Input() createButton: any;
  @Input() urlPrefix: string = '';
  @Input() title: string = '';
  // @ts-ignore
  @Input() entity: Entities;
  @Output() reloadData = new EventEmitter();
  @Output() rowActionEmitter = new EventEmitter();
  @ContentChild(TableActionsDirective, {read: TemplateRef}) actionsTemplateRef!: TemplateRef<any>;


  emptyDataConfig = {
    title      : '',
    icon       : 'app/theme/admin/assets/icons/bounce-cactus.svg',
    state      : 'Nothing to display',
    description: 'Start adding data by clicking the button bellow',
    inCard     : false,
    button     : {
      label    : 'Create row',
      className: 'btn-primary'
    }
  };

  perPageOptions = [10, 25, 50, 100];
  sortOptions = {
    asc : 'asc',
    desc: 'desc'
  };
  searchInputSubject: Subject<string> = new Subject();
  searchInput: string = '';
  faEdit = faEdit;
  faTrash = faTrash;
  isSearchState = false;
  subscriptions: Subscription[] = [];

  constructor(private qpService: QueryParamsService, private router: Router) {
    this
      .searchInputSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(async (value) => {
        value
          ? await this.qpService.updateParam('query', value)
          : await this.qpService.deleteParam('query');
      });
  }

  get policyActions() {
    return PolicyActions;
  }

  ngOnInit(): void {
    this.subscriptions.push(this.qpService.getParamSubs('page').subscribe((selectedPage: string) => {
      if (selectedPage) {
        this.selectedPage = Number(selectedPage);
      }
    }));

    this.subscriptions.push(this.qpService.getParamSubs('rowsPerPage').subscribe((perPage: string) => {
      if (perPage) {
        this.perPage = Number(perPage);
      }
    }));

    this.subscriptions.push(this.qpService.getParamSubs('query').subscribe((query: string) => {
      if (query) {
        this.searchInput = query;
      }
    }));

    this.isSearchState = !!this.qpService.getParamValue('query');
  }

  async onPageSelected(event: any) {
    this.selectedPage = event;
    if (this.selectedPage) {
      await this.qpService.updateParam('page', this.selectedPage);
    }
  }

  async onPerPageSelected() {
    if (this.perPage) {
      await this.qpService.updateParam('rowsPerPage', this.perPage);
    }
  }

  async sortByColumn(key: string) {
    const sortParams = {
      sortBy : this.qpService.getParamValue('sortBy'),
      sortOrder: this.qpService.getParamValue('sortOrder')
    };

    if (sortParams.sortBy && sortParams.sortBy === key) {
      if (sortParams.sortOrder) {
        sortParams.sortOrder = sortParams.sortOrder === this.sortOptions.asc ? this.sortOptions.desc : this.sortOptions.asc;
      }
    } else {
      sortParams.sortBy = key;
      sortParams.sortOrder = this.sortOptions.asc;
    }

    await this.qpService.updateParams(sortParams);
  }

  onSearch(value: string) {
    this.isSearchState = true;
    this.searchInputSubject.next(value);
  }

  onRowAction(type: string, row: any) {
    this.rowActionEmitter.emit({type, row});
  }

  getFieldValue(obj: any, key: string, type: string) {
    if (obj && key) {
      let fieldValue = _.get(obj, key);

      if (type === 'date') {
        fieldValue = moment(fieldValue).format('MMMM Do YYYY');
      }

      if(!fieldValue) {
        fieldValue = _.get(obj, key.split('.ro')[0]);
      }

      return fieldValue;
    }

    return null;
  }

  goToUrl(url: string[]) {
    if (url) {
      this.router.navigate(url);
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subs => {
      subs.unsubscribe();
    });
  }
}
