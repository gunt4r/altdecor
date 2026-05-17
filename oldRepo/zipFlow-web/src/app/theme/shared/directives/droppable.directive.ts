import { Directive, HostListener, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[appDroppable]'
})
export class DroppableDirective {

  @Output() onDrop = new EventEmitter<DragEvent>();

  constructor() {}

  @HostListener('dragover', ['$event']) onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.onDrop.emit(event);
  }

  @HostListener('drop', ['$event']) onDropEvent(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.onDrop.emit(event);
  }
}
