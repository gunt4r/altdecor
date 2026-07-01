import {Pipe, PipeTransform} from '@angular/core';

// Strips a leading product-code prefix (e.g. "Articol: 12204 ", "art. 12080 ")
// from a product title so the code can be shown separately as "Cod produs".
@Pipe({
  name: 'cleanTitle'
})
export class CleanTitlePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    return value.replace(/^\s*(articol|art\.?|cod(?:\s+produs)?)\s*:?\s*[\wА-Яа-я.\-\/]*\d[\wА-Яа-я.\-\/]*\s*/i, '').trim();
  }
}
