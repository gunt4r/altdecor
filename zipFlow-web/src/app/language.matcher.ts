import { UrlMatcher, UrlSegment } from '@angular/router';

export const supportedLanguages = ['ro', 'ru', 'en'];

export const languageMatcher: UrlMatcher = (segments) => {
  if (segments.length > 0 && supportedLanguages.includes(segments[0].path.toLowerCase())) {
    return {
      consumed: [segments[0]],
      posParams: {
        lang: new UrlSegment(segments[0].path.toLowerCase(), {})
      }
    };
  }

  return null;
};

export function getStoredLanguage(): string {
  if (typeof localStorage === 'undefined') {
    return 'ro';
  }

  const language = (localStorage.getItem('language') || 'ro').toLowerCase();
  return supportedLanguages.includes(language) ? language : 'ro';
}
