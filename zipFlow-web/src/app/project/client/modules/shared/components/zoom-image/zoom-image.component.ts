import {Component, Inject} from '@angular/core';
import {DIALOG_DATA, DialogRef} from "@angular/cdk/dialog";

@Component({
  selector: 'app-zoom-image',
  templateUrl: './zoom-image.component.html',
  styleUrl: './zoom-image.component.scss'
})
export class ZoomImageComponent {
  activeIndex = 0;

  constructor(private dialogRef: DialogRef, @Inject(DIALOG_DATA) public data: { images: string[], activeIndex: number }) {
    if (this.data.activeIndex)
      this.activeIndex = this.data.activeIndex;
  }

  close() {
    this.dialogRef.close();
  }
}
