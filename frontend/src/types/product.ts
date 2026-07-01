export type ProductImage = {
  id: number;
  image_path: string;
  image_url: string;
  sort_order: number;
  is_main: number;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  available_size: string;
quality_test: string;
pricing_system: string;
sample_test_system: string;
threading_forging: string;
installing_team: string;
  details_html?: string;
  short_description_html: string;
  query_phone: string;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
  seo_tags?: string | null;
  main_image?: string | null;
  main_image_url: string | null;
  images?: ProductImage[];
  created_at: string;
  
};
