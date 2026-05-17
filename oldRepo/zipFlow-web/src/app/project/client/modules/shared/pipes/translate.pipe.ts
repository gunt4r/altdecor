import {Pipe, PipeTransform} from '@angular/core';
import {TranslateService} from "../services/translate.service";
import * as _ from "lodash";

@Pipe({
  name: 'translate',
  pure: false
})
export class TranslatePipe implements PipeTransform {

  constructor(private translateService: TranslateService) {}

  transform(data: string | any, configs?: { [fieldKey: string]: unknown }): string {
    if(typeof data === 'string') {
      let translatedString = _.get(this.translateService.data, data) || data;

      if (configs) Object.keys(configs).forEach((variableKey) => {
        const variableValue = String(configs[variableKey]);
        const variablePlaceholder = `{{\\s*${variableKey}\\s*}}`;
        const regex = new RegExp(variablePlaceholder, 'g');
        translatedString = translatedString.replace(regex, variableValue);
      });

      return translatedString;
    } else {
      const language = localStorage.getItem('language') || 'ro';

      return data?.[language] || data || ''
    }
  }
}
