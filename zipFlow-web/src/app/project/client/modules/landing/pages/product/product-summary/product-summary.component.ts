import {Component, Input} from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";
import {PublicService} from "../../../../shared/services/public.service";

@Component({
  selector: 'app-product-summary',
  templateUrl: './product-summary.component.html',
  styleUrl: './product-summary.component.scss'
})
export class ProductSummaryComponent {
  @Input() productTabs: any;
  @Input() product: any;

  currentTab = 0;
  videoUrl: any;

  constructor(private sanitizer: DomSanitizer,
              private publicService: PublicService) {}

  ngOnInit(): void {
    if(this.product.fisa_tehnica?.video) {
      this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.product.fisa_tehnica?.video);
    }
  }

  changeTab(index: number) {
    this.currentTab = index;
  }

  downloadPdf() {
    if(this.product.fisa_tehnica?.document?.[0]?.file_url) {
      this.publicService.downloadPdf(this.product.fisa_tehnica.document[0].file_url).subscribe((data: any) => {
        const reader = new FileReader();

        reader.onload = () => {
          const pdfData = reader.result as string;

          this.downloadPdfFromStorage(pdfData);
        };
        reader.readAsDataURL(data);
      })
    }
  }

  downloadPdfFromStorage(pdfData: string) {
    const link = document.createElement('a');
    link.href = pdfData;
    link.download = `fisa_tehnica-${this.product.title?.['ro']}.pdf`;
    link.click();
  }
}
