import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TruncateService {

  constructor() { }

  truncateText(description: string, lines: number, maxLength: number): string {
    let truncated = description.slice(0, maxLength);
    // Ensure we're not truncating in the middle of a word
    truncated = truncated.substr(0, Math.min(truncated.length, truncated.lastIndexOf(" ")));
    // Add "..." if the description is longer than maxLength
    if (description.length > maxLength || truncated.split('\n').length > lines) {
      truncated += "...";
    }
    return truncated;
  }
}
