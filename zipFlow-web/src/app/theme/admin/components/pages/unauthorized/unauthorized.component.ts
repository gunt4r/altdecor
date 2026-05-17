import {Component} from '@angular/core';
import {QueryParamsService} from "../../../services/query-params.service";
import {getStringWords} from "../../../helpers/main.utils";

@Component({
  selector   : 'app-unauthorized',
  templateUrl: './unauthorized.component.html',
  styleUrls  : ['./unauthorized.component.scss']
})
export class UnauthorizedComponent {
  config = {
    title      : '',
    icon       : 'app/theme/admin/assets/icons/access-denied.svg',
    state      : 'Access Denied',
    description: 'Looks like you don’t have sufficient permissions to access this page'
  };

  constructor(private qpService: QueryParamsService) {
    this.config.title = [getStringWords(qpService.getParamValue('entity')),
      getStringWords(qpService.getParamValue('action'))].join(' ');
  }
}
