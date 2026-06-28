import {Component, OnInit, Inject, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {HttpGateway} from '../../../helpers/http.gateway';
import {lastValueFrom} from 'rxjs';
import {ToastrService} from 'ngx-toastr';
import {FileService} from '../../../services/file.service';

interface ConfigEntry {
  id?: number;
  data: any[];
  created_at?: string;
  updated_at?: string;
}

interface ConfigTypeDefinition {
  value: string;
  label: string;
  description: string;
  iconId: string;
  fields: FieldDef[];
  maxEntries?: number;
}

interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'toggle' | 'image' | 'translated' | 'dropdown' | 'children' | 'file' | 'icon' | 'tags' | 'projects';
  placeholder?: string;
  help?: string;
  required?: boolean;
  accept?: string;
  options?: {label: string; value: string}[];
}

@Component({
  selector: 'app-site-config',
  templateUrl: './site-config.component.html',
  styleUrls: ['./site-config.component.scss']
})
export class SiteConfigComponent implements OnInit {
  activeTab = 'desktop_menu';
  entries: ConfigEntry[] = [];
  filteredEntries: ConfigEntry[] = [];
  editingEntry: ConfigEntry | null = null;
  formData: Record<string, any> = {};
  isCreating = false;
  loading = true;
  saving = false;
  languages = ['ro', 'ru', 'en'];
  activeLang = 'ro';

  configTypes: ConfigTypeDefinition[] = [
    {
      value: 'desktop_menu',
      label: 'Desktop Menu',
      description: 'Items shown in the top navigation bar on desktop. Each item links to a product category page.',
      iconId: 'monitor',
      fields: [
        {key: 'label', label: 'Menu Label', type: 'translated', placeholder: 'e.g. Perete / Wall / Стены', help: 'The text shown in the menu. Translated per language.', required: true},
        {key: 'link', label: 'Link URL', type: 'text', placeholder: '/products?filter=product_category_contains_Perete', help: 'Where clicking this item navigates. Use product filter URLs.', required: true},
        {key: 'order_index', label: 'Display Order', type: 'number', placeholder: '1', help: 'Lower numbers appear first (1, 2, 3...).'},
        {key: 'is_active', label: 'Active', type: 'toggle', help: 'Toggle off to hide this item without deleting it.'}
      ]
    },
    {
      value: 'drawer_menu',
      label: 'Drawer Menu (Mobile)',
      description: 'Items in the mobile slide-out drawer. Can have sub-items (children).',
      iconId: 'smartphone',
      fields: [
        {key: 'label', label: 'Menu Label', type: 'translated', placeholder: 'e.g. Perete / Wall / Стены', help: 'The text shown in the drawer.', required: true},
        {key: 'link', label: 'Link URL', type: 'text', placeholder: '/products?filter=product_category_contains_Perete', help: 'Main link for this menu item.', required: true},
        {key: 'icon', label: 'Icon', type: 'icon', help: 'Choose a predefined icon or upload a custom one.'},
        {key: 'order_index', label: 'Display Order', type: 'number', placeholder: '1', help: 'Lower numbers appear first.'},
        {key: 'is_active', label: 'Active', type: 'toggle', help: 'Toggle off to hide.'},
        {key: 'children', label: 'Sub-items', type: 'children', help: 'Expandable sub-categories inside this menu item.'}
      ]
    },
    {
      value: 'homepage_category',
      label: 'Homepage Categories',
      description: 'Category cards shown on the homepage grid. Each has an image and label.',
      iconId: 'grid',
      fields: [
        {key: 'label', label: 'Category Name', type: 'translated', placeholder: 'e.g. Panouri decorative', help: 'Title shown on the category card.', required: true},
        {key: 'link', label: 'Link URL', type: 'text', placeholder: '/products?filter=product_category_contains_Panouri', help: 'Where clicking the card goes.', required: true},
        {key: 'image', label: 'Category Image', type: 'file', accept: 'image/*', help: 'Upload or paste URL of the background image for this card.'},
        {key: 'tags', label: 'Tags', type: 'tags', help: 'Short labels shown on the category card (e.g. "Panouri PVC", "SPC"). Add as many as you want; only the first 4 are displayed.'},
        {key: 'order_index', label: 'Display Order', type: 'number', placeholder: '1'},
        {key: 'is_active', label: 'Active', type: 'toggle'}
      ]
    },
    {
      value: 'designer_phones',
      label: 'Designer Phones',
      description: 'Phone numbers shown in the "Call a Designer" section. Each entry is one phone number.',
      iconId: 'phone',
      fields: [
        {key: 'label', label: 'Designer Name', type: 'translated', placeholder: 'e.g. Maria / Главный дизайнер', help: 'Name or title of the designer (shown above the phone number).', required: true},
        {key: 'link', label: 'Phone Number', type: 'text', placeholder: '+373 69 123 456', help: 'The actual phone number (with country code).', required: true},
        {key: 'order_index', label: 'Display Order', type: 'number', placeholder: '1'},
        {key: 'is_active', label: 'Active', type: 'toggle'}
      ]
    },
    {
      value: 'hero_banner',
      label: 'Hero & Promo Banners',
      description: 'First entry (order 1) = main hero banner at the top. Additional entries appear as clickable promo banners below the hero — each shows an image that links to a page.',
      iconId: 'image',
      fields: [
        {key: 'label', label: 'Banner Title', type: 'translated', placeholder: 'e.g. Materiale de Finisare Premium', help: 'Heading text. For hero: shown over the image. For promo: shown as overlay label.', required: true},
        {key: 'link', label: 'Click Link', type: 'text', placeholder: '/products', help: 'Where clicking this banner navigates (hero = CTA button, promo = entire banner click).'},
        {key: 'image', label: 'Banner Image', type: 'file', accept: 'image/*', help: 'Hero: background image (1920×800px). Promo: banner image (1200×400px).'},
        {key: 'order_index', label: 'Display Order', type: 'number', placeholder: '1', help: 'Order 1 = hero banner. Order 2, 3, ... = promo banners below hero.'},
        {key: 'is_active', label: 'Active', type: 'toggle'}
      ]
    },
    {
      value: 'hoverable_menu',
      label: 'Hoverable Menu (Mega Menu)',
      description: 'Categories and products shown in the desktop mega menu when hovering "Catalog". Each entry is one menu section.',
      iconId: 'link',
      fields: [
        {key: 'label', label: 'Section Name', type: 'translated', placeholder: 'e.g. Perete / Wall', help: 'The category group name shown in the mega menu.', required: true},
        {key: 'link', label: 'Section Link', type: 'text', placeholder: '/products?filter=product_type_contains_Perete', help: 'Where clicking the section name navigates.'},
        {key: 'children', label: 'Sub-categories', type: 'children', help: 'Sub-categories shown when hovering this section. Each child should have a label and link.'},
        {key: 'order_index', label: 'Display Order', type: 'number', placeholder: '1'},
        {key: 'is_active', label: 'Active', type: 'toggle'}
      ]
    },
    {
      value: 'catalog_pdf',
      label: 'Catalog PDF',
      description: 'The PDF catalog file available for download from the menu. Only one catalog allowed.',
      iconId: 'file',
      maxEntries: 1,
      fields: [
        {key: 'label', label: 'Catalog Name', type: 'translated', placeholder: 'e.g. Catalog 2026', help: 'Name of the catalog.', required: true},
        {key: 'link', label: 'PDF File', type: 'file', accept: 'application/pdf', help: 'Upload a PDF file or paste a URL.', required: true},
        {key: 'is_active', label: 'Active', type: 'toggle', help: 'Only one catalog should be active at a time.'}
      ]
    },
    {
      value: 'gallery_page',
      label: 'Gallery Page Header',
      description: 'The title and optional subtitle shown at the top of the "Proiectele Noastre" gallery page. Only one allowed.',
      iconId: 'image',
      maxEntries: 1,
      fields: [
        {key: 'label', label: 'Page Title', type: 'translated', placeholder: 'e.g. Proiectele Noastre / Наши проекты / Our Projects', help: 'Main heading at the top of the gallery page.', required: true},
        {key: 'subtitle', label: 'Subtitle', type: 'translated', placeholder: 'Optional intro line under the title', help: 'Optional text shown below the title.'},
        {key: 'is_active', label: 'Active', type: 'toggle', help: 'Toggle off to hide the gallery header.'}
      ]
    },
    {
      value: 'gallery_category',
      label: 'Gallery Categories',
      description: 'Categories (tabs) on the "Proiectele Noastre" page — e.g. Bucătărie, Living, Baie. Each category contains projects, and each project has its own photos. The count shown ("X proiecte") equals the number of projects.',
      iconId: 'grid',
      fields: [
        {key: 'label', label: 'Category Name', type: 'translated', placeholder: 'e.g. Bucătărie / Кухня / Kitchen', help: 'Tab label and section heading. Translated per language.', required: true},
        {key: 'order_index', label: 'Display Order', type: 'number', placeholder: '1', help: 'Lower numbers appear first (1, 2, 3...).'},
        {key: 'is_active', label: 'Active', type: 'toggle', help: 'Toggle off to hide this category without deleting it.'},
        {key: 'projects', label: 'Projects', type: 'projects', help: 'Each project has an optional title and a set of photos. The first photo is used as the cover tile; clicking it opens a carousel of that project\'s photos.'}
      ]
    }
  ];

  constructor(
    private gateway: HttpGateway,
    private toastr: ToastrService,
    private fileService: FileService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      await this.loadEntries();
    }
  }

  async loadEntries() {
    this.loading = true;
    try {
      const res: any = await lastValueFrom(
        this.gateway.get<any>('api/crud/site_config?page=1&rowsPerPage=200')
      );
      this.entries = res.data || [];
    } catch (e) {
      this.entries = [];
    }
    this.filterEntries();
    this.loading = false;
  }

  filterEntries() {
    this.filteredEntries = this.entries.filter(e => {
      const ct = this.getField(e, 'config_type');
      return ct === this.activeTab;
    });
    this.filteredEntries.sort((a, b) => {
      const oa = this.getField(a, 'order_index') || 999;
      const ob = this.getField(b, 'order_index') || 999;
      return Number(oa) - Number(ob);
    });
  }

  selectTab(tab: string) {
    this.activeTab = tab;
    this.cancelEdit();
    this.filterEntries();
  }

  getField(entry: ConfigEntry, key: string): any {
    for (const item of entry.data || []) {
      if (item && typeof item === 'object' && key in item) {
        return item[key];
      }
    }
    return null;
  }

  getLocalizedLabel(label: any): string {
    if (!label) return '';
    if (typeof label === 'string') return label;
    return label[this.activeLang] || label['ro'] || label['en'] || Object.values(label)[0] as string || '';
  }

  getActiveTypeDef(): ConfigTypeDefinition {
    return this.configTypes.find(t => t.value === this.activeTab)!;
  }

  getEntryCount(typeValue: string): number {
    return this.entries.filter(e => this.getField(e, 'config_type') === typeValue).length;
  }

  startCreate() {
    const typeDef = this.getActiveTypeDef();
    if (typeDef.maxEntries && this.filteredEntries.length >= typeDef.maxEntries) {
      this.toastr.warning(`Maximum ${typeDef.maxEntries} entry allowed for "${typeDef.label}". Edit the existing one instead.`);
      return;
    }
    this.editingEntry = null;
    this.isCreating = true;
    this.formData = {};
    typeDef.fields.forEach(f => {
      if (f.type === 'translated') {
        this.formData[f.key] = {ro: '', ru: '', en: ''};
      } else if (f.type === 'toggle') {
        this.formData[f.key] = true;
      } else if (f.type === 'children') {
        this.formData[f.key] = [];
      } else if (f.type === 'tags') {
        this.formData[f.key] = [];
      } else if (f.type === 'projects') {
        this.formData[f.key] = [];
      } else if (f.type === 'number') {
        this.formData[f.key] = this.filteredEntries.length + 1;
      } else {
        this.formData[f.key] = '';
      }
    });
  }

  startEdit(entry: ConfigEntry) {
    this.editingEntry = entry;
    this.isCreating = false;
    this.formData = {};
    const typeDef = this.getActiveTypeDef();
    typeDef.fields.forEach(f => {
      const val = this.getField(entry, f.key);
      if (f.type === 'translated') {
        this.formData[f.key] = typeof val === 'object' && val !== null
          ? {...val}
          : {ro: val || '', ru: '', en: ''};
      } else if (f.type === 'toggle') {
        this.formData[f.key] = val !== false && val !== 'false';
      } else if (f.type === 'children') {
        this.formData[f.key] = Array.isArray(val) ? val.map((c: any) => ({...c})) : [];
      } else if (f.type === 'tags') {
        this.formData[f.key] = Array.isArray(val) ? val.map((t: any) =>
          typeof t === 'object' && t !== null ? {...t} : {ro: t || '', ru: '', en: ''}
        ) : [];
      } else if (f.type === 'projects') {
        this.formData[f.key] = Array.isArray(val) ? val.map((p: any) => ({
          title: typeof p?.title === 'object' && p?.title !== null
            ? {...p.title}
            : {ro: p?.title || '', ru: '', en: ''},
          photos: Array.isArray(p?.photos)
            ? p.photos.map((ph: any) => typeof ph === 'string' ? ph : (ph?.file_url || ph?.url || '')).filter(Boolean)
            : []
        })) : [];
      } else if (f.type === 'file' || f.type === 'image') {
        // File fields may have arrays from DB (e.g. image: []) — normalize to string
        if (Array.isArray(val)) {
          this.formData[f.key] = val[0]?.file_url || val[0] || '';
        } else {
          this.formData[f.key] = val ?? '';
        }
      } else {
        this.formData[f.key] = val ?? '';
      }
    });
  }

  cancelEdit() {
    this.editingEntry = null;
    this.isCreating = false;
    this.formData = {};
    this.uploadedFileNames = {};
    this.iconMode = {};
    this.projectUploading = {};
  }

  addChild() {
    if (!this.formData['children']) this.formData['children'] = [];
    this.formData['children'].push({
      label: {ro: '', ru: '', en: ''},
      link: '',
      icon: 'circle'
    });
  }

  removeChild(index: number) {
    this.formData['children'].splice(index, 1);
  }

  addTag(fieldKey: string) {
    if (!this.formData[fieldKey]) this.formData[fieldKey] = [];
    this.formData[fieldKey].push({ro: '', ru: '', en: ''});
  }

  removeTag(fieldKey: string, index: number) {
    this.formData[fieldKey].splice(index, 1);
  }

  // ---- Projects (gallery categories) ----
  projectUploading: Record<number, number> = {};

  addProject() {
    if (!this.formData['projects']) this.formData['projects'] = [];
    this.formData['projects'].push({
      title: {ro: '', ru: '', en: ''},
      photos: []
    });
  }

  removeProject(index: number) {
    if (!confirm('Remove this project and all its photos?')) return;
    this.formData['projects'].splice(index, 1);
  }

  moveProject(index: number, direction: -1 | 1) {
    const projects = this.formData['projects'];
    const target = index + direction;
    if (target < 0 || target >= projects.length) return;
    [projects[index], projects[target]] = [projects[target], projects[index]];
  }

  onProjectPhotosSelected(event: Event, projectIndex: number) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const files = Array.from(input.files);
    const project = this.formData['projects'][projectIndex];
    if (!Array.isArray(project.photos)) project.photos = [];

    this.projectUploading[projectIndex] = (this.projectUploading[projectIndex] || 0) + files.length;

    files.forEach(file => {
      this.fileService.uploadFile(file, 'gallery').subscribe({
        next: (res: any) => {
          if (res?.file_url) project.photos.push(res.file_url);
          this.projectUploading[projectIndex] = Math.max(0, (this.projectUploading[projectIndex] || 1) - 1);
        },
        error: () => {
          this.projectUploading[projectIndex] = Math.max(0, (this.projectUploading[projectIndex] || 1) - 1);
          this.toastr.error(`Failed to upload ${file.name}`);
        }
      });
    });

    // reset the input so the same files can be re-selected if needed
    input.value = '';
  }

  removeProjectPhoto(projectIndex: number, photoIndex: number) {
    this.formData['projects'][projectIndex].photos.splice(photoIndex, 1);
  }

  movePhoto(projectIndex: number, photoIndex: number, direction: -1 | 1) {
    const photos = this.formData['projects'][projectIndex].photos;
    const target = photoIndex + direction;
    if (target < 0 || target >= photos.length) return;
    [photos[photoIndex], photos[target]] = [photos[target], photos[photoIndex]];
  }

  uploadingField: string | null = null;
  uploadedFileNames: Record<string, string> = {};
  iconMode: Record<string, 'file' | 'url' | 'predefined'> = {};

  predefinedIcons = [
    {label: 'Layers', value: 'layers'},
    {label: 'Hexagon', value: 'hexagon'},
    {label: 'Square', value: 'square'},
    {label: 'Puzzle', value: 'puzzle'},
    {label: 'Home', value: 'home'},
    {label: 'Ruler', value: 'ruler'},
    {label: 'Sliders', value: 'sliders'},
    {label: 'Droplets', value: 'droplets'},
    {label: 'Settings', value: 'settings'}
  ];

  getFileName(url: any): string {
    if (!url || typeof url !== 'string') return '';
    try {
      const decoded = decodeURIComponent(url);
      const parts = decoded.split('/');
      return parts[parts.length - 1].split('?')[0];
    } catch {
      return url.split('/').pop()?.split('?')[0] || url;
    }
  }

  isImageUrl(url: any): boolean {
    if (!url || typeof url !== 'string') return false;
    return /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?|$)/i.test(url);
  }

  clearFileField(fieldKey: string) {
    this.formData[fieldKey] = '';
    delete this.uploadedFileNames[fieldKey];
  }

  setIconMode(fieldKey: string, mode: 'file' | 'url' | 'predefined') {
    this.iconMode[fieldKey] = mode;
  }

  getIconMode(fieldKey: string): 'file' | 'url' | 'predefined' {
    if (this.iconMode[fieldKey]) return this.iconMode[fieldKey];
    const val = this.formData[fieldKey];
    if (val && (val.startsWith('http') || val.startsWith('/'))) {
      return 'url';
    }
    if (val && this.predefinedIcons.some(i => i.value === val)) {
      return 'predefined';
    }
    return 'file';
  }

  onFileSelected(event: Event, fieldKey: string) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.uploadingField = fieldKey;

    this.fileService.uploadFile(file, 'site-config').subscribe({
      next: (res: any) => {
        this.formData[fieldKey] = res.file_url;
        this.uploadedFileNames[fieldKey] = file.name;
        this.uploadingField = null;
        this.toastr.success('File uploaded');
      },
      error: () => {
        this.uploadingField = null;
        this.toastr.error('Upload failed');
      }
    });
  }

  onIconFileSelected(event: Event, fieldKey: string) {
    this.onFileSelected(event, fieldKey);
  }

  async save() {
    // Validate required fields
    const typeDef = this.getActiveTypeDef();
    for (const field of typeDef.fields) {
      if (field.required) {
        const val = this.formData[field.key];
        if (field.type === 'translated') {
          if (!val?.ro?.trim() && !val?.ru?.trim() && !val?.en?.trim()) {
            this.toastr.error(`"${field.label}" is required — fill at least one language.`);
            return;
          }
        } else if (!val && val !== 0 && val !== false) {
          this.toastr.error(`"${field.label}" is required.`);
          return;
        }
      }
    }

    // Validate children labels
    if (this.formData['children']?.length) {
      for (let i = 0; i < this.formData['children'].length; i++) {
        const child = this.formData['children'][i];
        const childLabel = child.label;
        const hasLabel = typeof childLabel === 'object'
          ? (childLabel?.ro?.trim() || childLabel?.ru?.trim() || childLabel?.en?.trim())
          : (typeof childLabel === 'string' && childLabel.trim());
        if (!hasLabel) {
          this.toastr.error(`Sub-item #${i + 1} must have a label. Remove it or fill the name.`);
          return;
        }
      }
    }

    // Validate tags — no empty tags allowed
    if (this.formData['tags']?.length) {
      for (let i = 0; i < this.formData['tags'].length; i++) {
        const tag = this.formData['tags'][i];
        const hasText = typeof tag === 'object'
          ? (tag?.ro?.trim() || tag?.ru?.trim() || tag?.en?.trim())
          : (typeof tag === 'string' && tag.trim());
        if (!hasText) {
          this.toastr.error(`Tag #${i + 1} is empty. Fill it in or remove it before saving.`);
          return;
        }
      }
    }

    // Validate projects — each project needs at least one photo
    if (this.formData['projects']?.length) {
      for (let i = 0; i < this.formData['projects'].length; i++) {
        const project = this.formData['projects'][i];
        if (!Array.isArray(project?.photos) || project.photos.length === 0) {
          this.toastr.error(`Project #${i + 1} has no photos. Upload at least one photo or remove the project.`);
          return;
        }
      }
    }

    this.saving = true;
    try {
      const dataArray: any[] = [{config_type: this.activeTab}];

      typeDef.fields.forEach(f => {
        if (f.key === 'children' || f.key === 'tags' || f.key === 'projects') return;
        const val = this.formData[f.key];
        dataArray.push({[f.key]: val});
      });

      if (this.formData['children']?.length) {
        dataArray.push({children: this.formData['children']});
      }

      // Always persist tags array (even empty) so admin can intentionally clear tags
      if (Array.isArray(this.formData['tags'])) {
        dataArray.push({tags: this.formData['tags']});
      }

      // Always persist projects array (even empty) so admin can intentionally clear them
      if (Array.isArray(this.formData['projects'])) {
        dataArray.push({projects: this.formData['projects']});
      }

      const payload = {data: dataArray};

      if (this.editingEntry?.id) {
        await lastValueFrom(
          this.gateway.put<any>(`api/crud/site_config/${this.editingEntry.id}`, payload)
        );
        this.toastr.success('Entry updated successfully!');
      } else {
        await lastValueFrom(
          this.gateway.post<any>('api/crud/site_config', payload)
        );
        this.toastr.success('Entry created successfully!');
      }

      this.cancelEdit();
      await this.loadEntries();
    } catch (e: any) {
      this.toastr.error(e?.error?.message || 'Failed to save entry');
    }
    this.saving = false;
  }

  async deleteEntry(entry: ConfigEntry) {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    try {
      await lastValueFrom(
        this.gateway.delete<any>(`api/crud/site_config/${entry.id}`)
      );
      this.toastr.success('Entry deleted');
      await this.loadEntries();
    } catch (e: any) {
      this.toastr.error('Failed to delete');
    }
  }

  async cloneEntry(entry: ConfigEntry) {
    try {
      const newData = entry.data.map((item: any) => {
        if (item && typeof item === 'object' && 'label' in item) {
          const label = item.label;
          if (typeof label === 'object') {
            const cloned: any = {};
            for (const [k, v] of Object.entries(label)) {
              cloned[k] = v + ' (copy)';
            }
            return {label: cloned};
          }
          return {label: label + ' (copy)'};
        }
        return {...item};
      });

      await lastValueFrom(
        this.gateway.post<any>('api/crud/site_config', {data: newData})
      );
      this.toastr.success('Entry cloned');
      await this.loadEntries();
    } catch (e: any) {
      this.toastr.error('Failed to clone');
    }
  }
}
