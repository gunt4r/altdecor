import {Component, Input} from '@angular/core';
import {Product} from "../recommendations.type";

@Component({
  selector: 'app-recommendation',
  templateUrl: './recommendation.component.html',
  styleUrl: './recommendation.component.scss'
})
export class RecommendationComponent {
  @Input({ required: true }) product!: Product;
}
