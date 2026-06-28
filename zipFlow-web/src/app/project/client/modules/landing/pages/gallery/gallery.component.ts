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

interface GalleryCategory {
  id: string;
  label: string;
  orderIndex: number;
  projects: GalleryProject[];
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
  lightboxIndex = 0;
  lightboxTitle = '';

  currentLanguage = 'ro';
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

        return {
          id: String(item.id),
          label: this.localize(findObjectByKey(item.data, 'label')),
          orderIndex: Number(findObjectByKey(item.data, 'order_index') || 999),
          projects
        };
      })
      .filter((cat: GalleryCategory) => cat.projects.length > 0);

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

  openLightbox(project: GalleryProject, photoIndex = 0) {
    this.lightboxPhotos = project.photos;
    this.lightboxIndex = photoIndex;
    this.lightboxTitle = project.title;
    this.lightboxOpen = true;
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden';
    }
  }

  closeLightbox() {
    this.lightboxOpen = false;
    this.lightboxPhotos = [];
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }

  nextPhoto() {
    if (!this.lightboxPhotos.length) return;
    this.lightboxIndex = (this.lightboxIndex + 1) % this.lightboxPhotos.length;
  }

  prevPhoto() {
    if (!this.lightboxPhotos.length) return;
    this.lightboxIndex = (this.lightboxIndex - 1 + this.lightboxPhotos.length) % this.lightboxPhotos.length;
  }

  goToPhoto(index: number) {
    this.lightboxIndex = index;
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
