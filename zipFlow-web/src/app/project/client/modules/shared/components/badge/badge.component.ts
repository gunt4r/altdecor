import {Component, Input} from '@angular/core';
import {Badge} from "./badge.type";

@Component({
  selector: 'app-badge',
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss'
})
export class BadgeComponent {
  @Input() badge: Badge = Badge.Dark;
  @Input() label!: string;
  @Input() radius!: string;
}
