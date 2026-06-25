"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/src/constants/api";

export interface ContactSettings {
  office_address: string;
  email: string;
  phone: string;
  whatsapp_number?: string;
  facebook_url?: string;
  youtube_url?: string;
  map_embed_code?: string;
}

export function useSiteSettings() {
  const [settings, setSettings] =useState<ContactSettings | null>(null);

  const [loading, setLoading] =useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/contact/settings`
        );

        const data = await res.json();

        setSettings(data.settings);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return {
    settings,
    loading,
  };
}