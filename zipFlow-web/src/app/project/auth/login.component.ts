import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  template: `
    <section style="min-height: 100vh; display: grid; place-items: center; padding: 32px; background: linear-gradient(180deg, #1d2329 0%, #0f1316 100%);">
      <div style="width: min(420px, 100%); background: #fff; border-radius: 28px; padding: 32px; box-shadow: 0 30px 80px rgba(0,0,0,.24);">
        <p style="margin: 0 0 8px; color: #bc8555; font-weight: 700;">Admin access</p>
        <h1 style="margin: 0 0 12px;">Login preview</h1>
        <p style="margin: 0 0 24px; color: #6a7076;">The restored checkout is missing the original auth flow. This screen is in place so the login route resolves cleanly while the real auth module is rebuilt.</p>
        <input type="email" placeholder="Email" style="width:100%;padding:14px 16px;border:1px solid #d9dde2;border-radius:14px;margin-bottom:12px;">
        <input type="password" placeholder="Password" style="width:100%;padding:14px 16px;border:1px solid #d9dde2;border-radius:14px;margin-bottom:16px;">
        <button type="button" style="width:100%;padding:14px 16px;border:0;border-radius:14px;background:#bc8555;color:#fff;font-weight:700;">Continue</button>
      </div>
    </section>
  `
})
export class LoginComponent {}
