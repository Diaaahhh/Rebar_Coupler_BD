export type Article = {
  id: number;
  slug: string;
  title_bn: string;
  title_en: string;
  content_bn_html: string;
  content_en_html: string;
  image_path: string | null;
  image_url: string | null;
  updated_at: string | null;
};
