export type ContactSettings = {
  id: number;
  office_address: string;
  email: string;
  phone: string;
  whatsapp_number: string;
  facebook_url: string;
  youtube_url: string;
  map_embed_code: string;
};

export type ContactMessage = {
  id: number;
  full_name: string;
  phone: string;
  email: string | null;
  description: string;
  created_at: string;
};
