import {Directive, TemplateRef} from '@angular/core';

@Directive({
  selector: '[appTableActions]',
  standalone: true
})
export class TableActionsDirective {

  constructor(private templateRef: TemplateRef<any>) {
  }
}
