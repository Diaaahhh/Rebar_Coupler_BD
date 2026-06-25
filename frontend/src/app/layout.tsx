import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getSiteSettings } from "@/src/lib/siteSettings";
import { siteConfig } from "@/src/lib/siteConfig";
import SiteChrome from "@/src/components/layout/SiteChrome";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const developerMeta =
  "Developed By: IGL Web Ltd Powered by : IGL Group Web address : http://www.iglweb.com Address : House 33, Road 04, Dhanmondi, Dhaka - 1205, Bangladesh, Cell : +880-1958-666999";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    metadataBase: new URL(siteConfig.siteUrl),

    title:
      settings.seo_title ||
      settings.site_title ||
      siteConfig.siteName,

    description:
      settings.seo_description ||
      siteConfig.defaultDescription,

    icons: {
      icon:
        settings.favicon_url ||
        "/favicon.ico",
    },

    robots: "ALL",

    other: {
      developer: developerMeta,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUrl = siteConfig.siteUrl;
  const isProduction = process.env.NODE_ENV === "production";

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta httpEquiv="content-type" content="text/html; charset=UTF-8" />
        <meta name="family" content="Arial" />
        <meta name="family" content="SutonnyMJ" />
        <meta name="family" content="Boishakhi;" />
        {isProduction && (
          <meta
            httpEquiv="Content-Security-Policy"
            content="upgrade-insecure-requests"
          />
        )}
        {isProduction && (
          <meta httpEquiv="refresh" content={`900; url=${currentUrl}`} />
        )}
        <meta property="og:type" content="website" />
      </head>
      <body className="min-h-screen flex flex-col">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
