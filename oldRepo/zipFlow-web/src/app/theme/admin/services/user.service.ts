import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {UserRepository} from '../repositories/user.repository';
import {setAll, setHeaders, setReady} from "../store/actions/user.actions";
import {anyObj} from "../interfaces/shared.types.interface";
import {getStoreValue} from "../helpers/main.utils";
import {selectHeaders} from "../store/selectors/user.selectors";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private store: Store, private userRepository: UserRepository) { }

  public async init() {
    const headers = await getStoreValue(this.store, selectHeaders);

    if (!headers || (headers && !headers['x-token'])) {
      const sessionUser: anyObj = await this.getSessionUser();

      // this.store.dispatch(setHeaders({
      //   headers: {
      //     // 'x-token': getXToken(sessionUser)
      //   }
      // }));

      const user = await this.getProfile();

      this.store.dispatch(setAll({user}));

      this.store.dispatch(setReady({
        isReady: true
      }));
    }
  }

  public getSessionUser(): Promise<anyObj> {
    return new Promise((resolve, reject) => {
      try {
        // @ts-ignore
        const {kuratorLib} = window;
        if (kuratorLib) {
          return kuratorLib.getCurrentUser((user: any) => resolve({
            email: user.mail,
            name : user.cn
          }));
        }
      } catch (error) {
        reject('No kurator lib available!');
      }
    });
  }

  public async getProfile() {
    return this.userRepository.getProfile();
  }
}
