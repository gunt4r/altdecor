import {
  AfterViewInit,
  Component,
  Inject,
  Input,
  OnChanges,
  PLATFORM_ID,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import {isPlatformBrowser} from "@angular/common";
import {from, map} from "rxjs";

interface Coordinates {
  latitude: number;
  longitude: number;
}

@Component({
  selector: 'app-custom-map',
  templateUrl: './custom-map.component.html',
  styleUrls: ['./custom-map.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CustomMapComponent implements AfterViewInit, OnChanges {
  @Input({required: true}) coordinates!: Coordinates;
  @Input() zoom: number = 16;
  @Input() tooltipText: string = "Altdecor Moldova";
  private map!: any;
  private marker!: any;

  constructor(@Inject(PLATFORM_ID) protected platformId: Object) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['coordinates']) {
      this.updateMap();
    }
  }

  ngAfterViewInit() {
    this.drawMap();
  }

  private drawMap() {
    if (isPlatformBrowser(this.platformId) && this.coordinates) {
      from(import('leaflet')).pipe(
        map((resL: any) => {
          const L = resL.default || resL;
          if (L.map) {
            this.map = L.map('map', {
              center: [this.coordinates.latitude, this.coordinates.longitude],
              zoom: this.zoom
            });

            const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 18,
              minZoom: 3
            });

            tiles.addTo(this.map);

            const customIcon = L.icon({
              iconUrl: 'assets/icons/map-pin.svg',
              iconSize: [24, 24],
              iconAnchor: [12, 5]
            });

            this.marker = L.marker([this.coordinates.latitude, this.coordinates.longitude], {icon: customIcon}).addTo(this.map);

            this.marker.bindTooltip(this.tooltipText, {
              permanent: true,
              direction: 'top'
            }).openTooltip();

            setTimeout(() => {
              this.map.invalidateSize();
            }, 3000)
          }
        })).subscribe()
    }
  }

  private updateMap() {
    if (this.map && this.coordinates) {
      this.map.setView([this.coordinates.latitude, this.coordinates.longitude], this.zoom);
      this.marker.setLatLng([this.coordinates.latitude, this.coordinates.longitude]);
    }
  }
}
