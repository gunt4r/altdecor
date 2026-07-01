export interface Page {
  link: PageSlug | string;
  modal?: boolean;
  label: string;
}

export enum PageSlug {
  Home = '',
  Shop = 'shop',
  Products = 'products',
  Checkout = 'checkout',
  ProductId = 'productId',
  Blog = 'blog',
  BlogId = 'blogId',
  NotFound = 'not-found',
  Contacts = 'contacts',
  Portfolio = 'portfolio',
  Proiecte = 'proiecte',
  AboutUs = 'about-us',
  Faq = 'faq',
  Dialog = 'd'
}

export const PageLabels: Record<PageSlug, string> = {
  [PageSlug.Shop]: 'Page.Shop',
  [PageSlug.Products]: 'Page.ProductsPage',
  [PageSlug.Blog]: 'Page.Blog',
  [PageSlug.BlogId]: 'Page.Blog.BlogId',
  [PageSlug.Portfolio]: 'Page.Portfolio',
  [PageSlug.Proiecte]: 'Page.Gallery'

} as Record<PageSlug, string>;

