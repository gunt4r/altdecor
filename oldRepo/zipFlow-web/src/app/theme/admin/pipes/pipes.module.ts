import {NgModule} from '@angular/core';
import {AssetsTransformPipe} from "./assets-transform.pipe";
import {KeysPipe} from "./keys.pipe";

@NgModule({
  declarations: [
    AssetsTransformPipe,
    KeysPipe
  ],
  imports: [],
  exports: [
    AssetsTransformPipe,
    KeysPipe
  ]
})
export class PipesModule {
}
