import {Directive, ElementRef, Inject, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from "@angular/common";

@Directive({
  selector: '[appTypeDelete]'
})
export class TypeDeleteDirective implements OnInit {
  @Input() text = '';
  @Input() wordsReplacement: any = [];

  private nodeRenderSpeed = 10;
  private textRenderSpeed = 5;
  private textRemoveSpeed = 150;
  private waitInterval = 200;

  constructor(private el: ElementRef, @Inject(PLATFORM_ID) private platformId: Object) {
  }

  async ngOnInit() {
    await this.typeDelete(this.text);
  }

  private async typeDelete(text: any) {
    const element = this.el.nativeElement;
    const nodes = [...element.childNodes]
    element.innerHTML = ''; // Clear existing content

    if (isPlatformBrowser(this.platformId)) {
      for (const el of nodes) {
        await new Promise((resolve: any) => {
          setTimeout(async () => {
            if (el.nodeName === '#text') {
              const textContent = el.textContent;

              for (let i = 0; i < textContent?.length; i++) {
                const char = textContent[i];

                await new Promise((resolveText: any) => {
                  setTimeout(async () => {
                    if (char === '<') {
                      element.innerHTML += '&lt;';
                    } else if (char === '>') {
                      element.innerHTML += '&gt;';
                    } else {
                      element.innerHTML += char;
                    }

                    const wrongWord = this.wordsReplacement.find((el: any) => element.innerHTML.includes(el.wrong));

                    if (wrongWord) {
                      await this.delay(this.waitInterval);

                      for (let removeIndex = 0; removeIndex < wrongWord.wrongCharsLength; removeIndex++) {

                        await new Promise((resolveWrongText: any) => {
                          setTimeout(() => {
                            element.innerHTML = element.innerHTML.slice(0, -1);

                            resolveWrongText(char);
                          }, this.textRemoveSpeed);
                        });
                      }

                      for (let correctCharIndex = 0; correctCharIndex < wrongWord.correct?.length; correctCharIndex++) {
                        const correctChar = wrongWord.correct[correctCharIndex];

                        if (correctCharIndex > wrongWord.wrong?.length - wrongWord.wrongCharsLength) {
                          await new Promise((resolveCorrectText: any) => {
                            setTimeout(() => {
                              element.innerHTML += correctChar;

                              resolveCorrectText(correctChar);
                            }, this.textRenderSpeed);
                          });
                        }
                      }
                    }
                    resolveText(char);
                  }, this.textRenderSpeed);
                });
              }
            } else {
              element.innerHTML += el.outerHTML;
            }
            resolve(el);
          }, this.nodeRenderSpeed);
        });
      }
    }
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
