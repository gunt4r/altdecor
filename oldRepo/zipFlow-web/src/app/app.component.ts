import {Component, Inject, OnInit, Renderer2} from '@angular/core';
import {CommonModule, DOCUMENT} from '@angular/common';
import {RouterOutlet} from '@angular/router';
import {AnalyticsService} from "./theme/admin/services/analytics.service";
import {AnalyticsType} from "./theme/admin/interfaces/analytics.interface";
import {PublicService} from "./project/client/modules/shared/services/public.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  constructor(@Inject(DOCUMENT) private document: any,
              private renderer: Renderer2,
              private publicService: PublicService
  ) {
  }

  ngOnInit() {
    this.publicService.getAnalytics().subscribe(({data}: any) => {
      data.forEach(({type, token, active}: any) => {
        if (type && active) this.renderAnalytics(type, token);
      })
    });
  }

  private renderAnalytics(type: AnalyticsType, key: string) {
    switch (type) {
      case AnalyticsType.FacebookPixel:
        this.loadFacebookPixel(key);
        return;
      case AnalyticsType.GoogleAnalytics:
        this.loadGoogleAnalytics(key);
        return;
    }
  }

  private loadFacebookPixel(pixelId: string): void {
    const pixelCode = `
    var pixelCode = function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${pixelId}');
    fbq('track', 'PageView');`;

    const scriptElement = this.renderer.createElement('script');
    this.renderer.setAttribute(scriptElement, 'id', 'pixel-script');
    this.renderer.setAttribute(scriptElement, 'type', 'text/javascript');
    this.renderer.setProperty(scriptElement, 'innerHTML', pixelCode);
    this.renderer.appendChild(this.document.head, scriptElement);
  }

  private loadGoogleAnalytics(trackingID: string): void {

    let gaScript = this.document.createElement('script');
    gaScript.setAttribute('async', 'true');
    gaScript.setAttribute('src', `https://www.googletagmanager.com/gtag/js?id=${trackingID}`);

    let gaScript2 = this.document.createElement('script');
    gaScript2.innerText = `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag(\'js\', new Date());gtag(\'config\', \'${trackingID}\');`;

    this.document.documentElement.firstChild.appendChild(gaScript);
    this.document.documentElement.firstChild.appendChild(gaScript2);
  }
}
