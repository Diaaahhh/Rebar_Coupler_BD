"use client";

import Link from "next/link";
import { Menu, X, Phone } from "lucide-react";
import { FaFacebookF, FaYoutube } from "react-icons/fa";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/src/constants/api";
import { siteData } from "@/src/constants/site";
import DynamicLogo from "@/src/components/layout/DynamicLogo";
import type { SiteSettings } from "@/src/types/site";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [phone, setPhone] = useState(siteData.phone);

  useEffect(() => {
    let active = true;

    const loadSettings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/site/settings`, {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { settings: SiteSettings };

        if (active && data.settings.phone) {
          setPhone(data.settings.phone);
        }
      } catch {
        // Keep static fallback phone if settings are unavailable.
      }
    };

    void loadSettings();

    return () => {
      active = false;
    };
  }, []);

  return (
    <header className="sticky top-0 z-50">
      {/* Gold Top Line */}
      <div
        className="h-[3px]"
        style={{
          background: "var(--accent)",
        }}
      />

      <nav
        className="
          backdrop-blur-md
          shadow-xl
        "
        style={{
          background: "var(--primary)",
        }}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-[90px]">
            {/* Logo */}
            <Link
              href="/"
              className="
                group
                transition-all
                duration-300
              "
            >
              <DynamicLogo className="h-auto max-h-[100px] w-auto transition-all duration-300 group-hover:scale-105" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-10">
              {siteData.navLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="
                    relative
                    text-white
                    font-medium
                    text-[15px]
                    tracking-wide
                    transition-all
                    duration-300
                    hover:text-[var(--accent)]
                    after:absolute
                    after:left-0
                    after:-bottom-2
                    after:h-[2px]
                    after:w-0
                    after:bg-[var(--accent)]
                    after:transition-all
                    after:duration-300
                    hover:after:w-full
                  "
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://www.facebook.com/RebarCouplerBangladesh"
                target="_blank"
                rel="noopener noreferrer"
                className="
      w-10
      h-10
      rounded-full
      flex
      items-center
      justify-center
      bg-white/10
      text-white
      transition-all
      duration-300
    "
                aria-label="Facebook"
                style={{
      background: "var(--secondary)",
    }}
              >
                <FaFacebookF size={18} />
              </a>

              <a
                href="https://www.youtube.com/@RebarCouplerBangladesh"
                target="_blank"
                rel="noopener noreferrer"
                className="
      w-10
      h-10
      rounded-full
      flex
      items-center
      justify-center
      bg-white/10
      text-white
      transition-all
      duration-300
    "
                aria-label="YouTube"
                 style={{
      background: "var(--danger)",
    }}
              >
                <FaYoutube size={20} />
              </a>
            </div>

            {/* Phone CTA */}
            <a
              href={`tel:${phone}`}
              className="
                hidden
                lg:flex
                items-center
                gap-2
                px-6
                py-3
                border
                border-white/20
                text-white
                font-semibold
                tracking-[2px]
                rounded-md
                transition-all
                duration-300
                hover:bg-[var(--accent)]
                hover:border-[var(--accent)]
                hover:-translate-y-1
                hover:shadow-lg
              "
            >
              <Phone size={17} />
              {phone}
            </a>

            {/* Mobile Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="
                lg:hidden
                text-white
                transition-all
                duration-300
                hover:text-[var(--accent)]
              "
            >
              {mobileOpen ? <X size={30} /> : <Menu size={30} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`
            lg:hidden
            overflow-hidden
            transition-all
            duration-500
            ease-in-out
            ${mobileOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}
          `}
        >
          <div
            className="
              border-t
              border-white/10
            "
          >
            <div className="container-custom py-6">
              <div className="flex flex-col gap-5">
                {siteData.navLinks.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="
                      text-white
                      font-medium
                      transition-all
                      duration-300
                      hover:text-[var(--accent)]
                      hover:translate-x-2
                    "
                  >
                    {item.label}
                  </Link>
                ))}

                <a
                  href={`tel:${phone}`}
                  className="
                    mt-4
                    flex
                    items-center
                    gap-2
                    text-white
                    font-medium
                  "
                >
                  <Phone size={16} />
                  {phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
