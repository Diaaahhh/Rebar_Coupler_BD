"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/src/constants/api";
import type { SiteSettings } from "@/src/types/site";

type DynamicLogoProps = {
  className?: string;
};

export default function DynamicLogo({ className = "" }: DynamicLogoProps) {
  const [logoUrl, setLogoUrl] = useState("/logo.png");

  useEffect(() => {
    let active = true;

    const loadLogo = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/site/settings`, {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { settings: SiteSettings };

        if (active && data.settings.logo_url) {
          setLogoUrl(data.settings.logo_url);
        }
      } catch {
        // Keep the default public logo if settings are not available.
      }
    };

    void loadLogo();

    return () => {
      active = false;
    };
  }, []);

  return (
    <img
      src={logoUrl}
      alt="Rebar Coupler"
      className={className}
    />
  );
}
