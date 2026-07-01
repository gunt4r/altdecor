import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  HostListener,
  Inject,
  OnInit,
  PLATFORM_ID
} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Page, PageLabels, PageSlug} from '../../../shared/components/page-container/pages.type';
import {PublicService} from '../../../shared/services/public.service';
import {MetaService} from '../../../shared/services/meta.service';
import {findObjectByKey} from '../../../../../../theme/shared/utils/form.utils';

interface GalleryProject {
  title: string;
  photos: string[];
}

// One grid tile. Each tile carries the photo set the lightbox should show
// when clicked, so grouped and ungrouped categories share one code path:
//  - grouped:   one tile per project   → lightbox = that project's photos
//  - ungrouped: one tile per photo     → lightbox = the whole section's photos
interface GalleryTile {
  photo: string;
  title: string;
  ratio: number; // aspect ratio (w/h), drives the justified grid; refined on load
  photos: string[];
  captions: string[];
  startIndex: number;
}

interface GalleryCategory {
  id: string;
  label: string;
  orderIndex: number;
  projects: GalleryProject[];
  tiles: GalleryTile[];
}

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss'
})
export class GalleryComponent implements OnInit {
  pages: Page[] = [
    {link: PageSlug.Products, label: PageLabels[PageSlug.Shop]},
    {link: PageSlug.Proiecte, label: PageLabels[PageSlug.Proiecte]}
  ];

  title = '';
  subtitle = '';
  categories: GalleryCategory[] = [];
  activeCategoryId = '';
  loading = true;

  // Lightbox state
  lightboxOpen = false;
  lightboxPhotos: string[] = [];
  lightboxCaptions: string[] = [];
  lightboxIndex = 0;
  lightboxTitle = '';

  currentLanguage = 'ro';

  // Skeleton placeholders: aspect ratios for shimmer tiles shown while loading.
  readonly skeletonSections = [1, 2, 3];
  readonly skeletonTiles = [1.5, 0.8, 1.6, 1.2, 1.7, 1.0, 1.4, 0.9, 1.5, 1.3];

  private rawConfig: any[] = [];

  constructor(private meta: MetaService,
              private router: Router,
              private publicService: PublicService,
              private cdr: ChangeDetectorRef,
              private destroy: DestroyRef,
              @Inject(PLATFORM_ID) private platformId: Object) {
  }

  ngOnInit() {
    this.meta.getMeta(this.router.url);
    this.currentLanguage = this.getLanguage();

    if (isPlatformBrowser(this.platformId)) {
      this.loadGallery();

      this.router.events.pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroy)
      ).subscribe(() => {
        const language = this.getLanguage();
        if (language !== this.currentLanguage) {
          this.currentLanguage = language;
          this.build();
          this.cdr.detectChanges();
        }
      });
    }
  }

  private loadGallery() {
    this.loading = true;
    this.publicService.getSiteConfig({page: 1, rowsPerPage: 200}).subscribe({
      next: (res: any) => {
        this.rawConfig = res?.data || [];
        this.build();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.rawConfig = [];
        this.categories = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private build() {
    // Fallback content: until real gallery categories are configured in the admin,
    // show placeholder projects so the page never looks empty. As soon as any real
    // gallery_category entry exists in site_config, this is skipped and the real
    // content takes over.
    if (!this.rawConfig.some((item: any) =>
      findObjectByKey(item.data, 'config_type') === 'gallery_category')) {
      this.rawConfig = [...this.rawConfig, ...this.galleryPlaceholderConfig()];
    }

    const pageEntry = this.rawConfig.find((item: any) =>
      findObjectByKey(item.data, 'config_type') === 'gallery_page'
      && findObjectByKey(item.data, 'is_active') !== false);

    this.title = pageEntry
      ? this.localize(findObjectByKey(pageEntry.data, 'label'))
      : '';
    this.subtitle = pageEntry
      ? this.localize(findObjectByKey(pageEntry.data, 'subtitle'))
      : '';

    const categoryEntries = this.rawConfig
      .filter((item: any) =>
        findObjectByKey(item.data, 'config_type') === 'gallery_category'
        && findObjectByKey(item.data, 'is_active') !== false)
      .sort((a: any, b: any) =>
        Number(findObjectByKey(a.data, 'order_index') || 999)
        - Number(findObjectByKey(b.data, 'order_index') || 999));

    this.categories = categoryEntries
      .map((item: any) => {
        const rawProjects = findObjectByKey(item.data, 'projects');
        const projects: GalleryProject[] = Array.isArray(rawProjects)
          ? rawProjects
            .map((p: any) => ({
              title: this.localize(p?.title),
              photos: Array.isArray(p?.photos)
                ? p.photos
                  .map((ph: any) => typeof ph === 'string' ? ph : (ph?.file_url || ph?.url || ''))
                  .filter((url: string) => !!url)
                : []
            }))
            .filter((p: GalleryProject) => p.photos.length > 0)
          : [];

        // Admin toggle: off (default) = every photo one by one; on = one cover per project.
        const groupByProject = findObjectByKey(item.data, 'group_photos') === true;

        let tiles: GalleryTile[];
        if (groupByProject) {
          tiles = projects.map((p) => ({
            photo: p.photos[0],
            title: p.title,
            ratio: 1.5,
            photos: p.photos,
            captions: p.photos.map(() => p.title),
            startIndex: 0
          }));
        } else {
          const allPhotos = projects.flatMap((p) => p.photos);
          const allCaptions = projects.flatMap((p) => p.photos.map(() => p.title));
          let index = 0;
          tiles = [];
          projects.forEach((p) => p.photos.forEach((photo) => {
            tiles.push({photo, title: p.title, ratio: 1.5, photos: allPhotos, captions: allCaptions, startIndex: index});
            index++;
          }));
        }

        return {
          id: String(item.id),
          label: this.localize(findObjectByKey(item.data, 'label')),
          orderIndex: Number(findObjectByKey(item.data, 'order_index') || 999),
          projects,
          tiles
        };
      })
      .filter((cat: GalleryCategory) => cat.tiles.length > 0);

    if (this.categories.length && !this.categories.some(c => c.id === this.activeCategoryId)) {
      this.activeCategoryId = this.categories[0].id;
    }
  }

  selectCategory(category: GalleryCategory) {
    this.activeCategoryId = category.id;
    if (!isPlatformBrowser(this.platformId)) return;
    const el = document.getElementById('gallery-cat-' + category.id);
    if (el) {
      el.scrollIntoView({behavior: 'smooth', block: 'start'});
    }
  }

  // Open the lightbox on the photo set the clicked tile carries.
  openLightbox(tile: GalleryTile) {
    this.lightboxPhotos = tile.photos;
    this.lightboxCaptions = tile.captions;
    this.lightboxIndex = tile.startIndex;
    this.lightboxTitle = tile.captions[tile.startIndex] || '';
    this.lightboxOpen = true;
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.classList.add('gallery-lightbox-open');
      this.scrollActiveThumbIntoView();
    }
  }

  closeLightbox() {
    this.lightboxOpen = false;
    this.lightboxPhotos = [];
    this.lightboxCaptions = [];
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.classList.remove('gallery-lightbox-open');
    }
  }

  nextPhoto() {
    if (!this.lightboxPhotos.length) return;
    this.lightboxIndex = (this.lightboxIndex + 1) % this.lightboxPhotos.length;
    this.lightboxTitle = this.lightboxCaptions[this.lightboxIndex] || '';
    this.scrollActiveThumbIntoView();
  }

  prevPhoto() {
    if (!this.lightboxPhotos.length) return;
    this.lightboxIndex = (this.lightboxIndex - 1 + this.lightboxPhotos.length) % this.lightboxPhotos.length;
    this.lightboxTitle = this.lightboxCaptions[this.lightboxIndex] || '';
    this.scrollActiveThumbIntoView();
  }

  goToPhoto(index: number) {
    this.lightboxIndex = index;
    this.lightboxTitle = this.lightboxCaptions[index] || '';
    this.scrollActiveThumbIntoView();
  }

  private scrollActiveThumbIntoView() {
    if (!isPlatformBrowser(this.platformId)) return;
    setTimeout(() => {
      const active = document.querySelector('.lightbox__thumb.active');
      active?.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'center'});
    });
  }

  // Refine the justified-grid layout once a tile's real dimensions are known.
  onTileLoad(event: Event, tile: GalleryTile) {
    const img = event.target as HTMLImageElement;
    if (!img?.naturalWidth || !img?.naturalHeight) return;
    const ratio = img.naturalWidth / img.naturalHeight;
    if (Math.abs(tile.ratio - ratio) > 0.01) {
      tile.ratio = ratio;
      this.cdr.detectChanges();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (!this.lightboxOpen) return;
    if (event.key === 'Escape') this.closeLightbox();
    else if (event.key === 'ArrowRight') this.nextPhoto();
    else if (event.key === 'ArrowLeft') this.prevPhoto();
  }

  projectCountLabel(count: number): string {
    if (this.currentLanguage === 'ru') {
      const mod10 = count % 10;
      const mod100 = count % 100;
      if (mod10 === 1 && mod100 !== 11) return 'проект';
      if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'проекта';
      return 'проектов';
    }
    if (this.currentLanguage === 'en') {
      return count === 1 ? 'project' : 'projects';
    }
    return count === 1 ? 'proiect' : 'proiecte';
  }

  // Placeholder gallery content shown when no real gallery_category is configured
  // yet, so the live page isn't empty. Uses real catalog images; shape mirrors
  // what the API returns for gallery_* config entries. Replaced automatically once
  // real content is added in the admin.
  private galleryPlaceholderConfig(): any[] {
    const pool = [
      'https://storage.googleapis.com/download/storage/v1/b/gardecor_storage/o/product%2F1782828862436_ChatGPT%20Image%2030%20iun.%202026,%2017_14_15.png?generation=1782828862801162&alt=media',
      'https://storage.googleapis.com/download/storage/v1/b/gardecor_storage/o/product%2F1782828544216_ChatGPT%20Image%2029%20iun.%202026,%2013_28_01.png?generation=1782828544585546&alt=media',
      'https://storage.googleapis.com/download/storage/v1/b/gardecor_storage/o/product%2F1782828065002_ChatGPT%20Image%2029%20iun.%202026,%2013_03_59.png?generation=1782828065411829&alt=media',
      'https://storage.googleapis.com/download/storage/v1/b/gardecor_storage/o/product%2F1782828930363_ChatGPT%20Image%2030%20iun.%202026,%2017_15_15.png?generation=1782828930674677&alt=media',
      'https://storage.googleapis.com/download/storage/v1/b/gardecor_storage/o/product%2F1782826895649_ChatGPT%20Image%2030%20iun.%202026,%2016_41_20.png?generation=1782826896003908&alt=media',
      'https://storage.googleapis.com/download/storage/v1/b/gardecor_storage/o/product%2F1782827978704_ChatGPT%20Image%2030%20iun.%202026,%2016_59_29.png?generation=1782827979059728&alt=media',
      'https://storage.googleapis.com/download/storage/v1/b/gardecor_storage/o/product%2F1782824760524_ChatGPT%20Image%2029%20iun.%202026,%2013_04_19.png?generation=1782824760811553&alt=media',
      'https://storage.googleapis.com/download/storage/v1/b/gardecor_storage/o/product%2F1780057603392_dssdsesd.jpg?generation=1780057603633438&alt=media',
      'https://storage.googleapis.com/download/storage/v1/b/gardecor_storage/o/product%2F1780057550448_dssddes.jpg?generation=1780057550688691&alt=media',
      'https://storage.googleapis.com/download/storage/v1/b/gardecor_storage/o/product%2F1780057414234_dssdddddsesd.jpg?generation=1780057414486775&alt=media',
      'https://storage.googleapis.com/download/storage/v1/b/gardecor_storage/o/product%2F1780057230059_dssddddesd.jpg?generation=1780057230317733&alt=media',
      'https://storage.googleapis.com/download/storage/v1/b/gardecor_storage/o/product%2F1780057185374_dsdes.jpg?generation=1780057185609007&alt=media',
    ];
    const cats = [
      {label: 'Bucătărie', n: 6},
      {label: 'Living', n: 7},
      {label: 'Dormitor', n: 5},
      {label: 'Baie', n: 4},
    ];
    let seed = 0;
    return cats.map((cat, ci) => ({
      id: `seed-${ci}`,
      data: [
        {config_type: 'gallery_category'},
        {is_active: true},
        {label: {ro: cat.label, ru: cat.label, en: cat.label}},
        {order_index: ci + 1},
        {group_photos: false},
        {
          projects: Array.from({length: cat.n}, () => ({
            title: '',
            photos: [pool[seed++ % pool.length]]
          }))
        }
      ]
    }));
  }

  private localize(value: any): string {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value[this.currentLanguage] || value['ro'] || value['en'] || (Object.values(value)[0] as string) || '';
  }

  private getLanguage(): string {
    if (typeof localStorage === 'undefined') return 'ro';
    return (localStorage.getItem('language') || 'ro').toLowerCase();
  }
}
