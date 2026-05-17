import {ChangeDetectionStrategy, Component, DestroyRef, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {PageSlug} from "../../shared/components/page-container/pages.type";
import {NavigationEnd, Router} from "@angular/router";
import {filter} from "rxjs/operators";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {isPlatformBrowser} from "@angular/common";

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrl: './pages.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PagesComponent implements OnInit {
  dialog: PageSlug = PageSlug.Dialog;
  activeDialog!: boolean;

  browseLoaded = false;

  constructor(@Inject(PLATFORM_ID) protected platformId: Object, private router: Router, private destroy: DestroyRef) {
  }

  ngOnInit() {
    this.browseLoaded = isPlatformBrowser(this.platformId);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      if (event.urlAfterRedirects.indexOf('?') === -1) {
        window.scrollTo(0, 0);
      }
    });
  }

  active(isActive: boolean) {
    this.activeDialog = isActive;
  }
}
