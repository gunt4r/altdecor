import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {lastValueFrom} from 'rxjs';
import {ProfileInterface, UserRepositoryInterface} from "../interfaces/user.repository.interface";

@Injectable({
  providedIn: 'root'
})
export class UserRepository implements UserRepositoryInterface {
  constructor(private http: HttpClient) { }

  public getProfile(): Promise<ProfileInterface> {
    return lastValueFrom(this.http.get<ProfileInterface>('profile')) as Promise<ProfileInterface>;
  }
}
