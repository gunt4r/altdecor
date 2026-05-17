import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {debounce} from "../utils/debounce.utils";

@Injectable({
  providedIn: 'root',
})
export class LoaderService {

  isLoading = new Subject<boolean>();

  constructor() {
  }

  show() {
    this.isLoading.next(true);
  }

  @debounce(700)
  hide() {
    this.isLoading.next(false);
  }
}
