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
  // When true the grid shows skeleton cards instead of products — used for the
  // initial load and when a fresh query (filter/sort) is being fetched.
  @Input() refetching: boolean = false;
  @Output() loadNextPage = new EventEmitter;

  skeletonItems = Array.from({length: 9});
}
