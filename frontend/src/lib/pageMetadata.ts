import type { Metadata } from "next";
import { siteConfig } from "@/src/lib/siteConfig";
import {
  absoluteSiteUrl,
  getSiteSettings,
  splitSeoList,
} from "@/src/lib/siteSettings";

type SiteMetadataOptions = {
  path: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
};

const developerMeta =
  "Developed By: IGL Web Ltd Powered by : IGL Group Web address : http://www.iglweb.com Address : House 33, Road 04, Dhanmondi, Dhaka - 1205, Bangladesh, Cell : +880-1958-666999";

export async function generateSiteMetadata({
  path,
  fallbackTitle,
  fallbackDescription,
}: SiteMetadataOptions): Promise<Metadata> {
  const settings = await getSiteSettings();
  const canonical = `${siteConfig.siteUrl}${path}`;
  const title =
    settings.seo_title ||
    fallbackTitle ||
    settings.site_title ||
    siteConfig.siteName;
  const description =
    settings.seo_description ||
    fallbackDescription ||
    siteConfig.defaultDescription;
  const ogImage = absoluteSiteUrl(
    settings.og_image_url || siteConfig.defaultOgImage
  );
  const favicon = absoluteSiteUrl(settings.favicon_url || siteConfig.favicon);

  return {
    metadataBase: new URL(siteConfig.siteUrl),
    title,
    description,
    keywords: splitSeoList(settings.seo_keywords),
    alternates: {
      canonical,
    },
    icons: {
      icon: favicon,
      shortcut: favicon,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: [
        {
          url: ogImage,
          alt: settings.site_title || siteConfig.siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: "ALL",
    other: {
      tag: settings.seo_tags || "",
      developer: developerMeta,
      "google-site-verification": settings.google_site_verification || "",
      "p:domain_verify": settings.pinterest_domain_verify || "",
      "fb:app_id": settings.fb_app_id || "",
      "ia:markup_url": canonical,
      "ia:markup_url_dev": canonical,
      "ia:rules_url": canonical,
      "ia:rules_url_dev": canonical,
    },
  };
}
