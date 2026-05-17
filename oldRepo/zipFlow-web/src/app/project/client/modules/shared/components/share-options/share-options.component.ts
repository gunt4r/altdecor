import {Component} from '@angular/core';

const SHARE_OPTIONS = [
  {
    icon: 'assets/images/content/facebook.svg',
    link: 'https://www.facebook.com/sharer/sharer.php?u='
  },
  {
    icon: 'assets/images/content/twitter.svg',
    link: 'https://twitter.com/intent/tweet?url='
  },
  // {
  //   icon: 'assets/images/content/pinterest.svg',
  //   // TODO: Add uuid for pinterest
  //   link: 'https://www.pinterest.com/pin/create/button/?url='
  // },
  // {
  //   icon: 'assets/images/content/linkedin.svg',
  //   link: 'https://www.linkedin.com/shareArticle/?url='
  // },
  {
    icon: 'assets/images/content/whatsapp.svg',
    link: 'https://wa.me/?text='
  },
  {
    icon: 'assets/images/content/telegram.svg',
    link: 'https://t.me/share/url?url='
  },
  {
    icon: 'assets/images/content/viber.svg',
    link: 'viber://forward?text='
  }
]

@Component({
  selector: 'app-share-options',
  templateUrl: './share-options.component.html',
  styleUrl: './share-options.component.scss'
})
export class ShareOptionsComponent {

  options = SHARE_OPTIONS;

  constructor() {
    const pageUrl = window.location.href;
    this.options = this.options.map(({ link, ...rest }) => {
      return {
        ...rest,
        link: link + pageUrl
      };
    });
  }
}
