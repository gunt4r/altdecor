import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Products} from "../products.type";

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.scss'
})
export class ProductsListComponent {
  @Input() products!: Products;
  @Input() loading: boolean = false;
  @Output() loadNextPage = new EventEmitter;
}
