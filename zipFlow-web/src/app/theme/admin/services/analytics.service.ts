import {Injectable} from '@angular/core';
import {CrudService} from './crud.service';
import {AnalyticsInterface, AnalyticsListResponse} from "../interfaces/analytics.interface";
import {AnalyticsRepository} from "../repositories/analytics.repository";

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService extends CrudService<AnalyticsInterface, AnalyticsListResponse> {
  constructor(protected override repository: AnalyticsRepository) {
    super(repository);
  }
}
