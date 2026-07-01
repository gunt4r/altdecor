import {ChangeDetectorRef, NgModule} from '@angular/core';
import {TranslatePipe} from "./translate.pipe";
import {SafeHtmlPipe} from "./safe-html.pipe";
import {CleanTitlePipe} from "./clean-title.pipe";
import {TranslateService} from "../services/translate.service";

const pipes = [
  TranslatePipe,
  SafeHtmlPipe,
  CleanTitlePipe
]

@NgModule({
  imports: [],
  declarations: [...pipes],
  exports: [...pipes],
  providers: [TranslateService]
})
export class SharedPipesModule {
}
