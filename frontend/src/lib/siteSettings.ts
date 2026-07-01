import { API_BASE_URL } from "@/src/constants/api";
import { siteConfig } from "@/src/lib/siteConfig";
import type { SiteSettings } from "@/src/types/site";

export const fallbackSiteSettings: SiteSettings = {
  id: 1,
  logo_path: "/logo.png",
  logo_url: "/logo.png",
  favicon_path: siteConfig.favicon,
  favicon_url: siteConfig.favicon,
  og_image_path: siteConfig.defaultOgImage,
  og_image_url: siteConfig.defaultOgImage,
  phone: "01814-445932",
  site_title: siteConfig.siteName,
  seo_title: siteConfig.siteName,
  seo_description: siteConfig.defaultDescription,
  seo_keywords: "",
  seo_tags: "",
  google_site_verification: "",
  pinterest_domain_verify: "",
  fb_app_id: "",
  updated_at: null,
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1500);

  try {
    const response = await fetch(`${API_BASE_URL}/api/site/settings`, {
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      return fallbackSiteSettings;
    }

    const data = (await response.json()) as { settings?: SiteSettings };
    return {
      ...fallbackSiteSettings,
      ...data.settings,
    };
  } catch {
    return fallbackSiteSettings;
  } finally {
    clearTimeout(timeout);
  }
}

export function absoluteSiteUrl(pathOrUrl: string | null | undefined) {
  if (!pathOrUrl) {
    return siteConfig.siteUrl;
  }

  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  return `${siteConfig.siteUrl}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

export function splitSeoList(value: string | null | undefined) {
  return (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
