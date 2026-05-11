import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { getStoredLanguage } from './language.matcher';

@Component({
  selector: 'app-language-redirect',
  standalone: true,
  template: ''
})
export class LanguageRedirectComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.navigateByUrl(`/${getStoredLanguage()}`);
  }
}
