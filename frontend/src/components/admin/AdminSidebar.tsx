"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import DynamicLogo from "@/src/components/layout/DynamicLogo";

const singleLinks = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "About Us", href: "/admin/about-us" },
  { label: "Blog", href: "/admin/article" },
  { label: "Video Gallery", href: "/admin/videos" },
];

const bottomLinks = [{ label: "Site Info", href: "/admin/site-info" }];

const dropdowns = [
  {
    label: "Products",
    key: "products",
    match: "/admin/products",
    links: [
      { label: "All Products", href: "/admin/products" },
      { label: "Add Product", href: "/admin/products/new" },
    ],
  },
  {
    label: "Contact",
    key: "contact",
    match: "/admin/contact",
    links: [
      { label: "Contact Details", href: "/admin/contact" },
      { label: "Contact Messages", href: "/admin/contact-messages" },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const matchedDropdown = dropdowns.find((item) =>
    pathname.startsWith(item.match)
  );
  const [openDropdown, setOpenDropdown] = useState<string | null>(
    matchedDropdown?.key || null
  );

  const toggleDropdown = (key: string) => {
    setOpenDropdown((current) => (current === key ? null : key));
  };

  return (
    <aside className="min-h-screen w-72 border-r border-white/10 bg-gradient-to-b from-[var(--primary-dark)] to-[#1f5f73] text-white shadow-xl">
      <div className="p-6">
        <Link
          href="/admin/dashboard"
          className="mb-7 flex justify-start rounded-lg bg-white/8 p-3"
        >
          <DynamicLogo className="h-16 w-auto object-contain" />
        </Link>

        <p className="text-xs font-semibold uppercase tracking-[3px] text-white/60">
          Admin Menu
        </p>

        <nav className="mt-7 space-y-2">
          {singleLinks.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-4 py-3 text-sm font-bold uppercase tracking-[1.5px] transition ${
                  active
                    ? "bg-white/18 text-white shadow-sm"
                    : "text-white/85 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          {dropdowns.map((group) => {
            const isOpen = openDropdown === group.key;
            const isActive = pathname.startsWith(group.match);

            return (
              <div key={group.key}>
                <button
                  type="button"
                  onClick={() => toggleDropdown(group.key)}
                  className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-bold uppercase tracking-[1.5px] transition ${
                    isActive
                      ? "bg-white/18 text-white shadow-sm"
                      : "text-white/85 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span>{group.label}</span>
                  <ChevronDown
                    size={17}
                    className={`transition ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isOpen && (
                  <ul className="mt-2 space-y-1 border-l border-white/20 pl-3">
                    {group.links.map((item) => {
                      const active = pathname === item.href;

                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={`block rounded px-3 py-2 text-sm font-medium transition ${
                              active
                                ? "bg-white/15 text-white"
                                : "text-white/75 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}

          {bottomLinks.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-4 py-3 text-sm font-bold uppercase tracking-[1.5px] transition ${
                  active
                    ? "bg-white/18 text-white shadow-sm"
                    : "text-white/85 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
