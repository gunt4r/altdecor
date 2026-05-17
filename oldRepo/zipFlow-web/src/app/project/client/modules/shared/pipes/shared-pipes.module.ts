import {ChangeDetectorRef, NgModule} from '@angular/core';
import {TranslatePipe} from "./translate.pipe";
import {SafeHtmlPipe} from "./safe-html.pipe";
import {TranslateService} from "../services/translate.service";

const pipes = [
  TranslatePipe,
  SafeHtmlPipe
]

@NgModule({
  imports: [],
  declarations: [...pipes],
  exports: [...pipes],
  providers: [TranslateService]
})
export class SharedPipesModule {
}
