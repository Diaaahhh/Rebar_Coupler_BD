"use client";

import Link from "next/link";
import { Menu, X, Phone, ChevronRight } from "lucide-react";
import { FaFacebookF, FaYoutube } from "react-icons/fa";
import { useEffect, useState, useRef } from "react";
import { API_BASE_URL } from "@/src/constants/api";
import { siteData } from "@/src/constants/site";
import DynamicLogo from "@/src/components/layout/DynamicLogo";
import type { SiteSettings } from "@/src/types/site";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [phone, setPhone] = useState(siteData.phone);
  const [scrolled, setScrolled] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    const loadSettings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/contact/settings`, {
          cache: "no-store",
        });

        if (!response.ok) return;

const data = (await response.json()) as {
  settings: {
    phone: string;
    whatsapp_number: string;
    facebook_url: string;
    youtube_url: string;
  };
};
        if (active && data.settings.phone) {
          setPhone(data.settings.phone);
        }
      } catch {
        // Keep static fallback phone if settings are unavailable.
      }
    };

    void loadSettings();

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      active = false;
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close drawer on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileOpen &&
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        setMobileOpen(false);
      }
    };
    if (mobileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "shadow-2xl" : ""
        }`}
      >
        {/* Top Accent Line */}
        <div
          className="h-1 w-full"
          style={{
            background:
              "linear-gradient(90deg, var(--primary-dark), var(--accent), var(--primary-light))",
          }}
        />

        <nav
          className="transition-all duration-500"
          style={{
            background: scrolled ? "rgba(11,143,34,0.95)" : "var(--primary)",
            backdropFilter: scrolled ? "blur(12px)" : "none",
          }}
        >
          <div className="container-custom">
            <div
              className={`flex items-center justify-between transition-all duration-500 ${
                scrolled ? "h-[70px]" : "h-[90px]"
              }`}
            >
              {/* Logo */}
              <Link
                href="/"
                className="group relative z-50 flex items-center transition-all duration-300 hover:scale-105"
              >
                <div
                  className={`transition-all duration-500 ${
                    scrolled ? "h-[68px]" : "h-[80px] lg:h-[90px]"
                  }`}
                >
                  <DynamicLogo className="h-full w-auto object-contain" />
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-md lg:flex xl:gap-6">
                {siteData.navLinks.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="group relative rounded-full px-4 py-2 text-[15px] font-semibold text-white transition-all duration-300 hover:bg-white/20 hover:text-white"
                  >
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Action Buttons (Desktop) */}
              <div className="hidden items-center gap-4 lg:flex">
                <div className="flex items-center gap-3 border-r border-white/20 pr-4">
                  <a
                    href="https://www.facebook.com/RebarCouplerBangladesh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#1877F2] hover:shadow-lg"
                    aria-label="Facebook"
                  >
                    <FaFacebookF size={16} />
                  </a>
                  <a
                    href="https://www.youtube.com/@RebarCouplerBangladesh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#FF0000] hover:shadow-lg"
                    aria-label="YouTube"
                  >
                    <FaYoutube size={16} />
                  </a>
                </div>

                <a
                  href={`tel:${phone}`}
                  className="group relative flex overflow-hidden rounded-full font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  style={{
                    background: "var(--accent)",
                  }}
                >
                  <span className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="relative flex items-center gap-2 px-6 py-2.5">
                    <Phone size={16} className="animate-pulse" />
                    <span className="tracking-wider">{phone}</span>
                  </span>
                </a>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileOpen(true)}
                className="relative z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-300 hover:bg-white/20 active:scale-95 lg:hidden"
                aria-label="Open Menu"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {/* Drawer Content */}
        <div
          ref={drawerRef}
          className={`absolute right-0 top-0 flex h-full w-[85%] max-w-[360px] flex-col bg-white shadow-2xl transition-transform duration-500 ease-in-out ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Drawer Header */}
          <div
            className="flex items-center justify-between p-6"
            style={{
              background:
                "linear-gradient(135deg, var(--primary-dark), var(--primary))",
            }}
          >
            <div className="h-10 rounded bg-white/10 p-2 backdrop-blur-md">
              <DynamicLogo className="h-full w-auto object-contain brightness-0 invert" />
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 hover:rotate-90"
              aria-label="Close Menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Drawer Links */}
          <div className="flex-1 overflow-y-auto px-6 py-8">
            <div className="flex flex-col gap-2">
              {siteData.navLinks.map((item, i) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="group flex items-center justify-between rounded-xl p-4 font-bold text-gray-800 transition-all hover:bg-gray-50"
                  style={{
                    animationDelay: `${i * 50}ms`,
                  }}
                >
                  <span className="transition-transform group-hover:translate-x-2 group-hover:text-[var(--primary)]">
                    {item.label}
                  </span>
                  <ChevronRight
                    size={18}
                    className="text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-[var(--primary)]"
                  />
                </Link>
              ))}
            </div>

            <div className="my-8 h-px bg-gray-100" />

            {/* Mobile Contact Info */}
            <div className="space-y-6">
              <div className="flex flex-col gap-3">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Call Us Directly
                </p>
                <a
                  href={`tel:${phone}`}
                  className="flex items-center justify-center gap-3 rounded-xl py-4 font-bold text-white shadow-lg transition-transform active:scale-95"
                  style={{ background: "var(--accent)" }}
                >
                  <Phone size={18} />
                  {phone}
                </a>
              </div>

              <div className="flex flex-col gap-3">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Follow Us
                </p>
                <div className="flex gap-4">
                  <a
                    href="https://www.facebook.com/RebarCouplerBangladesh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 flex-1 items-center justify-center rounded-xl bg-[#1877F2]/10 text-[#1877F2] transition-colors hover:bg-[#1877F2] hover:text-white"
                  >
                    <FaFacebookF size={20} />
                  </a>
                  <a
                    href="https://www.youtube.com/@RebarCouplerBangladesh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 flex-1 items-center justify-center rounded-xl bg-[#FF0000]/10 text-[#FF0000] transition-colors hover:bg-[#FF0000] hover:text-white"
                  >
                    <FaYoutube size={24} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
