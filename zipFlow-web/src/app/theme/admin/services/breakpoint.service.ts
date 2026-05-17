import {DestroyRef, Injectable} from '@angular/core';
import {BreakpointObserver} from '@angular/cdk/layout';
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Injectable({
  providedIn: 'root'
})
export class BreakpointService {
  public isDesktop: boolean;
  public isTablet: boolean;
  public isMobile: boolean;

  constructor(breakpointObserver: BreakpointObserver, private destroy: DestroyRef) {
    breakpointObserver.observe([
      '(max-width: 991px)', '(max-width: 767px)'
    ]).pipe(takeUntilDestroyed(this.destroy)).subscribe(result => {
      if (result.breakpoints['(max-width: 767px)']) {
        this.isMobile = true;
        this.isTablet = false;
        this.isDesktop = false;
      } else if (result.breakpoints['(max-width: 991px)']) {
        this.isMobile = true;
        this.isTablet = true;
        this.isDesktop = false;
      } else {
        this.isMobile = false;
        this.isTablet = false;
        this.isDesktop = true;
      }
    });
  }
}
