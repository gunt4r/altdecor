import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-dialog-container',
  templateUrl: './dialog-container.component.html',
  styleUrl: './dialog-container.component.scss'
})
export class DialogContainerComponent {
  @Output() onClose: EventEmitter<boolean> = new EventEmitter();

  close() {
    this.onClose.emit(true);
  }
}
