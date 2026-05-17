import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  styleUrl: './counter.component.scss'
})
export class CounterComponent implements OnInit{
  @Input() value: number = 0;
  @Input() min: number = 0;
  @Input() max: number = Infinity;
  @Output() counterChange = new EventEmitter<number>;
  count = this.value;

  ngOnInit() {
    this.count = this.value;
  }

  increment(): void {
    if (this.count < this.max) {
      this.count++;
      this.counterChange.emit(this.count);
    }
  }

  decrement(): void {
    if (this.count > this.min) {
      this.count--;
      this.counterChange.emit(this.count);
    }
  }
}
