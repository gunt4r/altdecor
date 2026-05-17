import {NgModule} from '@angular/core';
import {DroppableDirective} from "./droppable.directive";

@NgModule({
  declarations: [DroppableDirective],
  providers: [],
  exports: [
    DroppableDirective
  ]
})
export class SharedDirectivesModule {
}
