import {Component, Input} from '@angular/core';
import {RouterTabListInterface} from "../../../interfaces/router-tab-list.interface";

@Component({
  selector   : 'app-router-nav-list',
  templateUrl: './router-nav-list.component.html',
  styleUrls  : ['./router-nav-list.component.scss']
})
export class RouterNavListComponent {
  @Input() routerList: RouterTabListInterface[] = [];
}
