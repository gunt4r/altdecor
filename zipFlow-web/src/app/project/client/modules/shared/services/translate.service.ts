import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TranslateService {
  private readonly languageSubject = new BehaviorSubject<string>(this.readLanguage());
  readonly language$ = this.languageSubject.asObservable();

  translate(language: string): void {
    const normalized = (language || 'ro').toLowerCase();
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('language', normalized);
    }
    this.languageSubject.next(normalized);
  }

  getCurrentLanguage(): string {
    return this.languageSubject.value;
  }

  private readLanguage(): string {
    if (typeof localStorage === 'undefined') {
      return 'ro';
    }
    return (localStorage.getItem('language') || 'ro').toLowerCase();
  }
}
