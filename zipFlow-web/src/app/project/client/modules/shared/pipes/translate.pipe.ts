import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'translate'
})
export class TranslatePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }

    if (!value.includes('.')) {
      return value;
    }

    const lastSegment = value.split('.').pop() || value;
    return lastSegment.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
}
