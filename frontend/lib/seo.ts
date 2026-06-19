import { Metadata } from "next";
import { siteConfig } from "./siteConfig";

interface SEOProps {
  title: string;
  description: string;
  path: string;
  image?: string;
}

export function generateSEO({
  title,
  description,
  path,
  image,
}: SEOProps): Metadata {
  const url = `${siteConfig.siteUrl}${path}`;

  return {
    title,
    description,

    alternates: {
      canonical: url,
    },

    openGraph: {
      title,
      description,
      url,
      images: [image || siteConfig.defaultOgImage],
      type: "website",
    },

    twitter: {
      title,
      description,
      images: [image || siteConfig.defaultOgImage],
    },
  };
}