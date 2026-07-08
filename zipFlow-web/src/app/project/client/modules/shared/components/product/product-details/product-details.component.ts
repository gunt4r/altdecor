import {ChangeDetectorRef, Component, Inject, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {Product, ProductSize, VatLabels} from "../product.type";
import {SelectOption} from "../../select/select.type";
import {CartProductService} from "../../../services/cart-products.service";
import {Router} from "@angular/router";
import {isPlatformBrowser} from "@angular/common";
import {findObjectByKey} from "../../../../../../../theme/shared/utils/form.utils";
import {PublicService} from "../../../services/public.service";

interface ProductLabel {
  label: string,
  item?: string
}

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss'
})
export class ProductDetailsComponent implements OnInit {
  @Input({required: true}) product!: Product;
  @Input() cart = false;
  contactPhone: any = {};

  vatLabels = VatLabels;
  selectedSizes!: ProductSize;
  labels: { [key: string]: string } = {
    model: 'Product.Label.Model',
    type: 'Product.Label.Type',
    material: 'Product.Label.Material',
    depth: 'Product.Label.Depth',
    width: 'Product.Label.Width',
    length: 'Product.Label.Length'
  };

  sizesOptions!: SelectOption<ProductSize>[];

  initialOption!: string;

  quantity = 1;

  isFavorite = false;
  private readonly favKey = 'favorite_products';

  constructor(private cartService: CartProductService,
              private router: Router,
              private publicService: PublicService,
              private cdr: ChangeDetectorRef,
              @Inject(PLATFORM_ID) private platformId: Object) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      if (this.product.sizes) {
        this.selectedSizes = this.product.sizes[0];

        if(this.product.sizes) {
          this.sizesOptions = this.product.sizes.map((sizes) => ({
            label: this.getSizesOption(sizes),
            value: sizes
          }));

          this.initialOption = this.getSizesOption(this.selectedSizes);
        }
      }
      this.isFavorite = this.readFavorites().includes(String(this.product.id));

      this.publicService.getGeneralDetails().subscribe((response: any) => {
        if (response && response.data) {
          this.contactPhone = {
            main_phone: findObjectByKey(response.data?.[0]?.data, 'main_phone'),
          };
          this.cdr.detectChanges();
        }
      })
    }
  }

  private readFavorites(): string[] {
    if (!isPlatformBrowser(this.platformId)) {
      return [];
    }
    try {
      const raw = JSON.parse(localStorage.getItem(this.favKey) || '[]');
      return Array.isArray(raw) ? raw.map((id: any) => String(id)) : [];
    } catch {
      return [];
    }
  }

  toggleFavorite() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const id = String(this.product.id);
    const list = this.readFavorites();
    const idx = list.indexOf(id);
    if (idx >= 0) {
      list.splice(idx, 1);
      this.isFavorite = false;
    } else {
      list.push(id);
      this.isFavorite = true;
    }
    localStorage.setItem(this.favKey, JSON.stringify(list));
  }

  getSizeMeasure(size: number | string): string {
    return size + ' ' + this.product.measure;
  }

  changeOption(sizes: ProductSize | unknown) {
    this.selectedSizes = sizes as ProductSize;
    this.product.price = (sizes as ProductSize).price;
    this.product.stock = (sizes as ProductSize).stock;
  }

  getQuantity(amount: number) {
    this.quantity = amount;
  }

  private getSizesOption(sizes: ProductSize): string {
    return `${sizes.width} × ${sizes.length} × ${sizes.height} ${this.product.measure}`;
  }

  addToCart() {
    this.cartService.addProductToCart(
      {
        id: this.product.id,
        img: this.product.images[0].path,
        name: this.product.title,
        price: this.product.price.current,
        oldPrice: this.product.price.old,
        model: this.product.model,
        quantity: this.quantity,
        size: this.getSizesOption(this.selectedSizes),
        sku: this.product.labels[0],
        characteristic: this.product.characteristic
      }
    );
  }

  buyNow() {
    this.addToCart();
    this.router.navigate(['/checkout']);
  }
}
