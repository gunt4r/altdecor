import {Pipe, PipeTransform} from '@angular/core';
import {environment} from "../../../../environments/environment";

@Pipe({
  name: 'assetsUrl'
})
export class AssetsTransformPipe implements PipeTransform {
  transform(url: string): string {
    // return environment.assetsUrl + url;
    return url;
  }
}
