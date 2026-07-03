import {Component, ElementRef, HostListener, Inject, PLATFORM_ID} from '@angular/core';
import {AbstractComponent} from "../abstract/abstract.component";
import {NavItemInterface} from "../../../interfaces/nav-item.interface";
import {Store} from "@ngrx/store";
import {Router} from "@angular/router";
import {Entities, PolicyActions} from "../../../dictionary/permissions.dictionary";
import {PermissionsService} from "../../../services/permissions.service";
import {AuthService} from "../../../services/auth.service";
import {EntityService} from "../../../services/entity.service";
import {HttpGateway} from "../../../helpers/http.gateway";
import {isPlatformBrowser} from "@angular/common";
import {Subject, forkJoin, of, lastValueFrom} from "rxjs";
import {catchError, debounceTime, distinctUntilChanged} from "rxjs/operators";

interface SearchResultItem {
  id: string | number;
  label: string;
}

interface SearchResultGroup {
  slug: string;
  label: string;
  items: SearchResultItem[];
}

@Component({
  selector   : 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls  : ['./navbar.component.scss']
})
export class NavbarComponent extends AbstractComponent {
  public isCollapsed = true;
  public searchTerm = '';
  public isSearching = false;
  public showResults = false;
  public results: SearchResultGroup[] = [];

  private entities: { slug: string; label: string }[] = [];
  private searchSubject = new Subject<string>();
  private language = 'ro';

  // Label field candidates, in priority order, for building a readable result title.
  private readonly labelKeys = ['title', 'name', 'question', 'label', 'street', 'sku', 'code'];

  public navItems: NavItemInterface[] = [];

  constructor(
    protected override store: Store,
    protected permissionService: PermissionsService,
    private authService: AuthService,
    private entityService: EntityService,
    private gateway: HttpGateway,
    private router: Router,
    private elementRef: ElementRef,
    @Inject(PLATFORM_ID) protected override platformId: Object
  ) {
    super(store, permissionService, platformId);

    if (isPlatformBrowser(this.platformId)) {
      this.language = localStorage.getItem('language') || 'ro';
      this.loadEntities();

      this.searchSubject
        .pipe(debounceTime(300), distinctUntilChanged())
        .subscribe((value) => this.runSearch(value));
    }
  }

  get entitiesDict() {
    return Entities;
  }

  get policyActions() {
    return PolicyActions;
  }

  private async loadEntities() {
    try {
      const list: any = await this.entityService.getCrudList();
      const rows = Array.isArray(list) ? list : (list?.data || []);
      this.entities = rows
        .filter((e: any) => e?.slug)
        .map((e: any) => ({slug: e.slug, label: e.label || e.slug}));
    } catch {
      this.entities = [];
    }
  }

  onSearch(value: string) {
    this.searchTerm = value;
    if (!value || value.trim().length < 2) {
      this.showResults = false;
      this.results = [];
      this.isSearching = false;
      return;
    }
    this.showResults = true;
    this.isSearching = true;
    this.searchSubject.next(value.trim());
  }

  private runSearch(term: string) {
    if (!term || term.length < 2 || !this.entities.length) {
      this.isSearching = false;
      return;
    }

    const calls = this.entities.map((entity) =>
      this.gateway
        .get<any>(`api/crud/${entity.slug}`, {
          params: {query: term, page: 1, rowsPerPage: 5} as any
        })
        .pipe(catchError(() => of({data: []})))
    );

    forkJoin(calls).subscribe((responses: any[]) => {
      // A newer keystroke may have superseded this batch.
      if (this.searchTerm.trim() !== term) {
        return;
      }

      const groups: SearchResultGroup[] = [];
      responses.forEach((res, i) => {
        const rows = res?.data || [];
        const items = rows
          .map((row: any) => ({id: row.id, label: this.extractLabel(row)}))
          .filter((item: SearchResultItem) => item.id != null);
        if (items.length) {
          groups.push({slug: this.entities[i].slug, label: this.entities[i].label, items});
        }
      });

      this.results = groups;
      this.isSearching = false;
    });
  }

  private extractLabel(row: any): string {
    const data = row?.data;
    const objects: any[] = Array.isArray(data) ? data : (data ? [data] : []);

    for (const key of this.labelKeys) {
      for (const obj of objects) {
        if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
          const val = this.pickValue(obj[key]);
          if (val) return val;
        }
      }
    }

    // Fallback: first primitive/translatable value we can find.
    for (const obj of objects) {
      if (!obj) continue;
      for (const k of Object.keys(obj)) {
        const val = this.pickValue(obj[k]);
        if (val) return val;
      }
    }

    return `#${row?.id ?? ''}`;
  }

  private pickValue(val: any): string {
    if (val == null) return '';
    if (typeof val === 'string') return this.clean(val);
    if (typeof val === 'number') return String(val);
    if (typeof val === 'object' && !Array.isArray(val)) {
      // Translation object {en, ro, ru}
      const candidate = val[this.language] || val['ro'] || val['en'] || val['ru'];
      if (typeof candidate === 'string') return this.clean(candidate);
    }
    return '';
  }

  private clean(s: string): string {
    return s.replace(/<[^>]*>/g, '').trim();
  }

  selectResult(slug: string, id: string | number) {
    this.closeResults();
    this.searchTerm = '';
    void this.router.navigate(['/admin/crud', slug, id]);
  }

  clearSearch() {
    this.searchTerm = '';
    this.results = [];
    this.showResults = false;
    this.isSearching = false;
  }

  closeResults() {
    this.showResults = false;
  }

  focusSearch() {
    if (this.searchTerm.trim().length >= 2 && this.results.length) {
      this.showResults = true;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeResults();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closeResults();
  }

  logout() {
    this.authService.logout();
  }
}
