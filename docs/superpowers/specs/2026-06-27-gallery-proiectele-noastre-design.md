# Gallery — "Proiectele Noastre" — Design

Date: 2026-06-27

## Goal

A new public gallery page ("Proiectele Noastre") fully configurable from the admin
`site_config` section. Title, subtitle, category tabs, projects and photos are all
admin-editable; photos are stored in Google Cloud Storage. Clicking a project opens a
fullscreen carousel of that project's photos.

## Constraints / context

- Frontend: Angular 17 SSR (`zipFlow-web`). Backend: Java/Spring (`zipFlow-server`).
- `site_config` is a schemaless dynamic entity: each row is `data: any[]` (array of
  single-key objects), discriminated by a `config_type` entry. Public read endpoint
  `api/public/crud/site_config` and admin CRUD `api/crud/site_config` already exist.
- File uploads go to GCS via `fileService.uploadFile(file, directory)` → `{ file_url }`.
- **No backend changes required.** Feature is frontend-only.

## Data model (two new `config_type`s in `site_config`)

1. `gallery_page` (maxEntries: 1) — page header
   - `title` (translated ro/ru/en)
   - `subtitle` (translated, optional)

2. `gallery_category` — one entry per tab/section (Bucătărie, Living, Baie, …)
   - `label` (translated) — tab label + section heading
   - `order_index` (number) — sort order
   - `is_active` (toggle)
   - `projects` — NEW field type. Ordered list; each project:
     - `title` (translated, optional)
     - `photos`: string[] of GCS `file_url`s (first = cover)

   "X proiecte" count = `projects.length`.

## Admin (site-config.component.ts / .html)

- Add the two config types to the `configTypes` array (with field schemas).
- Implement a new `'projects'` field type:
  - Accordion list of projects; add/remove/reorder projects.
  - Per project: translated title input (reusing existing translated-input pattern) +
    multi-photo uploader (upload to GCS folder `gallery`, thumbnail previews,
    remove/reorder photos).
  - Persisted in the `data` array as `{ projects: [...] }` (handled like the existing
    `children`/`tags` special-cased fields in `save()`/`startEdit()`/`startCreate()`).

## Public page (GalleryComponent)

- New route slug `proiecte` (add to `PageSlug`, `pages-routing.module.ts`, declare in
  pages module).
- Reads `getSiteConfig({page:1, rowsPerPage:200})`, filters `gallery_page` +
  `gallery_category` (active, sorted by `order_index`).
- Renders: page title + subtitle; sticky tab bar (category labels, smooth-scroll to
  section); per category: heading + "N proiecte" + grid of project cover tiles.
- Clicking a tile opens a fullscreen lightbox carousel of that project's photos
  (`ngx-slick-carousel`, already installed) with arrow/keyboard nav + close.
- Localizes via the existing `localStorage.language` + `findObjectByKey` pattern.

## Navigation

- Add "Proiectele Noastre" (ro: "Proiectele Noastre", ru: "Наши проекты",
  en: "Our Projects") to header `staticNavLinks` and the footer links → `/proiecte`.

## Out of scope (YAGNI)

- No backend/migration, no new upload endpoint, no per-project descriptions,
  no category reordering UI beyond `order_index`.
