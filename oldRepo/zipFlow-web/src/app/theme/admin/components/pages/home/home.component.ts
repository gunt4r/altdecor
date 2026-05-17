import {Component} from '@angular/core';

@Component({
  selector   : 'app-home',
  templateUrl: './home.component.html',
  styleUrls  : ['./home.component.scss']
})
export class HomeComponent {
  config = {
    title      : '',
    icon       : 'app/theme/admin/assets/icons/dashboard.svg',
    state      : 'Welcome to the app',
    description: 'Use the left menu to start adding data'
  };
}
