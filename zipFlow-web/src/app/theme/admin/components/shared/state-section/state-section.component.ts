import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector   : 'app-state-section',
  templateUrl: './state-section.component.html',
  styleUrls  : ['./state-section.component.scss']
})
export class StateSectionComponent {
  @Input() title: string = '';
  @Input() icon: string = '';
  @Input() state: string = '';
  @Input() description: string = '';
  @Input() button: any;
  @Input() inCard: boolean = true;

  @Output() buttonClicked = new EventEmitter();
}
