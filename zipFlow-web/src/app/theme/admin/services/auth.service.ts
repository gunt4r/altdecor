import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import moment from "moment";
import {HttpClient} from "@angular/common/http";
import {Observable, of} from "rxjs";
import {AUTH_LOCAL_TOKEN_KEY} from "../../auth/auth.constants";
import {Page} from "../interfaces/page.interface";
import {ApisService} from "./apis.service";
import {LoginCredentials, LoginResponse} from "../../auth/pages/login/login.dictionary";


@Injectable()
export class AuthService {
  constructor(
    private router: Router,
    private http: HttpClient,
    private apis: ApisService,
  ) {
  }

  login(credentials: LoginCredentials) {
    localStorage.removeItem(AUTH_LOCAL_TOKEN_KEY);

    return this.http.post<LoginResponse>(this.apis.login(), credentials).pipe().subscribe(({token}) => {
      localStorage.setItem(AUTH_LOCAL_TOKEN_KEY, token);
      void this.router.navigate([Page.Admin]);
    })
  }


  logout() {
    localStorage.removeItem(AUTH_LOCAL_TOKEN_KEY);
    void this.router.navigate([Page.Auth]);
  }

  getToken() {
    return localStorage.getItem(AUTH_LOCAL_TOKEN_KEY);
  }

  isAuthenticated(): Observable<boolean> {
    const jwtSession = this.getToken();

    if (jwtSession) return of(this.getExpiration(jwtSession) > moment().unix());

    return of(false);
  }

  private getExpiration(token: string): number {
    const parsedJwt = this.parseJwt(token);

    if (parsedJwt) {
      return parsedJwt.exp;
    }

    return moment().unix();
  }

  private parseJwt(token: string) {
    const base64Url = token?.split('.')[1];
    if (!base64Url) return;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    if (!base64) return;

    try {
      const jsonPayload = decodeURIComponent(window.atob(base64)?.split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      if (!jsonPayload) return;

      return JSON.parse(jsonPayload);
    } catch (e) {
      console.log("Invalid token", e)
    }
  };
}
