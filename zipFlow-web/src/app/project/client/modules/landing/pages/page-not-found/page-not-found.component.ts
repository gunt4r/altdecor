import {Component, OnInit} from '@angular/core';
import {MetaService} from "../../../shared/services/meta.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.scss'
})
export class PageNotFoundComponent implements OnInit {
  constructor(private meta: MetaService, private router: Router) {}

  ngOnInit() {
    this.meta.getMeta(this.router.url)
  }
}
