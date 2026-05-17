import {Injectable} from '@angular/core';
import {CrudRepository} from "./crud.repository";
import {HttpGateway} from "../helpers/http.gateway";
import {AnalyticsInterface, AnalyticsListResponse} from "../interfaces/analytics.interface";

@Injectable({
  providedIn: 'root'
})
export class AnalyticsRepository extends CrudRepository<AnalyticsInterface, AnalyticsListResponse> {
  constructor(protected override gateway: HttpGateway) {
    super(gateway, 'analytics');
  }
}

