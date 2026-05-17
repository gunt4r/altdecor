import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-specification',
  templateUrl: './specification.component.html',
  styleUrl: './specification.component.scss'
})
export class SpecificationComponent {
  @Input({ required: true }) specification!: any;
  @Input() contactPhone!: any;
}
