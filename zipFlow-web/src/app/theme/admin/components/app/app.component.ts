import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {UserService} from "../../services/user.service";
import {Store} from "@ngrx/store";
import {selectReady} from "../../store/selectors/user.selectors";
import {LoaderService} from "../../services/loader.service";

@Component({
  selector: 'app-admin-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  // @ts-ignore
  isReady$: Observable<boolean>;
  title = 'zip-flow';

  constructor(
    private userService: UserService,
    private loader: LoaderService,
    private store: Store
  ) {
  }

  async ngOnInit() {
    this.loader.show();

    this.isReady$ = this.store.select(selectReady);

    await this.userService.init();

    this.loader.hide();
  }
}
