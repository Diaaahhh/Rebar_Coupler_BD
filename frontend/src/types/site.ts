export type SiteSettings = {
  id: number;
  logo_path: string;
  logo_url: string;
  favicon_path?: string | null;
  favicon_url?: string | null;
  og_image_path?: string | null;
  og_image_url?: string | null;
  phone: string;
  site_title: string;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
  seo_tags?: string | null;
  google_site_verification?: string | null;
  pinterest_domain_verify?: string | null;
  fb_app_id?: string | null;
  updated_at: string | null;
};
