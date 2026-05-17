import {Component, Input, OnInit} from '@angular/core';
import {NgbAccordionConfig} from '@ng-bootstrap/ng-bootstrap';
import {AccordionItemInterface} from "../../../interfaces/accordion-item.interface";

@Component({
  selector   : 'app-accordion',
  templateUrl: './accordion.component.html',
  styleUrls  : ['./accordion.component.scss'],
  providers  : [NgbAccordionConfig]
})
export class AccordionComponent {
  @Input() accordionItems: AccordionItemInterface[] = [];

  constructor(config: NgbAccordionConfig) {
    // customize default values of accordions used by this component tree
    config.closeOthers = true;
    // config['type'] = 'info';
  }
}
