import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-placeholder-page',
  template: `
    <section style="padding: 120px 24px 80px; max-width: 1200px; margin: 0 auto;">
      <div style="background: #fff; border-radius: 24px; padding: 32px; box-shadow: 0 20px 60px rgba(23,23,23,.08);">
        <p style="margin: 0 0 8px; color: #bc8555; font-weight: 700;">Preview route</p>
        <h1 style="margin: 0 0 12px;">{{ title }}</h1>
        <p style="margin: 0; color: #6a7076;">The restored homepage, header, drawer, mega menu, and admin site configuration are wired. This placeholder keeps the app buildable while the remaining original pages are still missing from the checkout.</p>
      </div>
    </section>
  `
})
export class PlaceholderPageComponent {
  constructor(private route: ActivatedRoute) {}

  get title(): string {
    return this.route.snapshot.data['title'] || 'Page';
  }
}
