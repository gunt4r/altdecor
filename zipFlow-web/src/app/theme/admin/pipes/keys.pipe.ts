import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'keys',  pure: false})
export class KeysPipe implements PipeTransform {
  transform(value: any, args: any[] = []): any {
    return Object.keys(value).filter(el => !args.find(filterValue => filterValue === el))
  }
}
