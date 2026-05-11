import {UrlSegment} from "@angular/router";

const supportedLanguages = ['ro', 'ru', 'en'];
const defaultLanguage = 'ro';

export function languageMatcher(segments: UrlSegment[]) {
  // Take language from localstorage if not find set empty string
  const language: string = localStorage.getItem('language')?.toLocaleLowerCase() || "";
  const isSupportedLang = supportedLanguages.includes(language);
  const firstSegmentLang = segments.length > 0 && supportedLanguages.includes(segments[0].path);

  // Check if language from localstorage is supported
  if (isSupportedLang) {
    // Check if first segment is a language and it is supported
    if (firstSegmentLang) {
      segments[0].path = language; // Set segment path to localstorage variable
    }
    else { // If segment.path is not language we suppose that this is a route
      // Push new segment in start of segment array
      segments.unshift(new UrlSegment(language, {}));
    }
  }
  // Checks if segments are empty this could mean '' main page, or first segment is not language
  // we suppose it is a route
  else if (segments.length === 0 || !firstSegmentLang) {
    segments.unshift(new UrlSegment(defaultLanguage, {}));
  }
  return { consumed: segments.slice(0, 1) }; // Consume the language segment
}
