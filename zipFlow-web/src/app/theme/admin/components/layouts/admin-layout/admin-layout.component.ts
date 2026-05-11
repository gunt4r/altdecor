import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-layout',
  template: `
    <div style="min-height:100vh;display:grid;grid-template-columns:280px minmax(0,1fr);background:#f5f6f8;">
      <aside style="background:#171b1f;color:#fff;padding:28px 20px;display:flex;flex-direction:column;gap:18px;">
        <div>
          <p style="margin:0 0 6px;color:#bc8555;font-weight:700;">Altdecor Admin</p>
          <h2 style="margin:0;font-size:24px;">Content tools</h2>
        </div>
        <a routerLink="site-config" routerLinkActive="active" style="padding:14px 16px;border-radius:16px;background:rgba(255,255,255,.06);">Site configuration</a>
      </aside>
      <main style="padding:32px;">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AdminLayoutComponent {}
