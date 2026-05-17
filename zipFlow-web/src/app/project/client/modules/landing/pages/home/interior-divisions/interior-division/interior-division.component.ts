import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-interior-division',
  templateUrl: './interior-division.component.html',
  styleUrl: './interior-division.component.scss'
})
export class InteriorDivisionComponent {
  @Input({ required: true }) config!: any;
}
