import {Component, Input} from '@angular/core';
import {Page, PageLabels} from "./pages.type";

@Component({
  selector: 'app-page-container',
  templateUrl: './page-container.component.html',
  styleUrl: './page-container.component.scss'
})
export class PageContainerComponent {
  @Input() pages!: Page[];
}
