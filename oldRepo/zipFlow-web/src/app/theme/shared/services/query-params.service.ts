import {Injectable} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

@Injectable({providedIn: 'root'})
export class QueryParamsService {

  constructor(public router: Router, public activatedRoute: ActivatedRoute) {
  }

  public getParamValue(paramName: string): string | null {
    return this.activatedRoute.snapshot.queryParamMap.get(paramName);
  }

  public updateParams(queryParams: any): void {
    this.router.navigate(
      [],
      {
        relativeTo: this.activatedRoute,
        queryParams,
        queryParamsHandling: 'merge'
      }).catch(console.error);
  }

  public updateParam(key: string, value: string | number): void {
    this.router.navigate(
      [],
      {
        relativeTo: this.activatedRoute,
        queryParams: {[key]: value},
        queryParamsHandling: 'merge'
      }).catch(console.error);
  }

  public deleteParam(key: string): Promise<boolean> {
    return this.router.navigate(
      [],
      {
        relativeTo: this.activatedRoute,
        queryParams: {[key]: null},
        queryParamsHandling: 'merge'
      });
  }

  public deleteParams(queryParams: any): Promise<boolean> {
    return this.router.navigate(
      [],
      {
        relativeTo: this.activatedRoute,
        queryParams,
        queryParamsHandling: 'merge'
      });
  }
}
