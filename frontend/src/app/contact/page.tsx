import { Suspense } from "react";
import { Mail, MapPin, MessageCircle, Phone, Play } from "lucide-react";
import { API_BASE_URL } from "@/src/constants/api";
import ContactForm from "@/src/components/contact/ContactForm";
import type { ContactSettings } from "@/src/types/contact";
import { generateSiteMetadata } from "@/src/lib/pageMetadata";
import {FaFacebookF,FaYoutube,} from "react-icons/fa";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return generateSiteMetadata({
    path: "/contact",
    fallbackTitle: "Contact",
  });
}

async function getSettings() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/contact/settings`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { settings: ContactSettings };
    return data.settings;
  } catch {
    return null;
  }
}

function getMapSrc(embedCode?: string) {
  if (!embedCode) {
    return "";
  }

  const srcMatch = embedCode.match(/src=["']([^"']+)["']/i);

  if (srcMatch?.[1]) {
    return srcMatch[1];
  }

  if (embedCode.startsWith("https://www.google.com/maps/embed")) {
    return embedCode;
  }

  return "";
}

export default async function ContactPage() {
  const settings = await getSettings();
  const mapSrc = getMapSrc(settings?.map_embed_code);
  const whatsappHref = settings?.whatsapp_number
    ? `https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, "")}`
    : "";

  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-16">
      <div className="container-custom">
        <div className="mb-10 text-center">
          <p className="font-semibold uppercase tracking-[3px] text-[var(--primary)]">
            Contact
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-gray-200 bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">
              Office Information
            </h2>
            <p className="mt-2 text-gray-600">
              Reach us directly or send a message using the form.
            </p>

            <div className="mt-7 space-y-6 text-gray-700">
              <div className="flex gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                  <MapPin size={20} />
                </span>
                <div>
                  <h3 className="font-bold text-gray-900">Office Address</h3>
                  <p className="mt-1 whitespace-pre-line">
                    {settings?.office_address}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                  <Mail size={20} />
                </span>
                <div>
                  <h3 className="font-bold text-gray-900">Email</h3>
                  <a
                    href={`mailto:${settings?.email}`}
                    className="mt-1 block text-[var(--primary)]"
                  >
                    {settings?.email}
                  </a>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                  <Phone size={20} />
                </span>
                <div>
                  <h3 className="font-bold text-gray-900">Contact Number</h3>
                  <a
                    href={`tel:${settings?.phone}`}
                    className="mt-1 block text-[var(--primary)]"
                  >
                    {settings?.phone}
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {/* {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-green-600 text-white transition hover:-translate-y-1 hover:shadow-lg"
                  aria-label="WhatsApp"
                >
                  <MessageCircle size={20} />
                </a>
              )} */}
              {settings?.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1877f2] text-lg font-bold text-white transition hover:-translate-y-1 hover:shadow-lg"
                  aria-label="Facebook"
                >
                  <FaFacebookF
  size={24}
  color="white"
/>
                </a>
              )}
              {settings?.youtube_url && (
                <a
                  href={settings.youtube_url}
                  target="_blank"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-white transition hover:-translate-y-1 hover:shadow-lg"
                  aria-label="YouTube"
                >
                  <FaYoutube
  size={24}
  color="white"
/>
                </a>
              )}
            </div>
          </div>

          <Suspense fallback={<div className="border p-6">Loading form...</div>}>
            <ContactForm />
          </Suspense>
        </div>

        <div className="mt-10 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          {mapSrc ? (
            <iframe
              src={mapSrc}
              className="h-[420px] w-full"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="p-10 text-center text-gray-600">
              Google Map embed will appear here after admin adds it.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
