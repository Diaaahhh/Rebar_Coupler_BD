"use client";
import { Building2, Phone, Mail, ExternalLink } from "lucide-react";
import { FaFacebookF, FaYoutube } from "react-icons/fa";
import { useSiteSettings } from "@/src/hooks/useSiteSettings";
import { contactData } from "@/src/constants/contact";

const contactRows = [
  {
    icon: Building2,
    label: "অফিসের ঠিকানা",
    isLink: false,
  },
  {
    icon: Phone,
    label: "ফোন করুন",
    isLink: true,
    hrefPrefix: "tel:",
  },
  {
    icon: Mail,
    label: "ইমেইল করুন",
    isLink: true,
    hrefPrefix: "mailto:",
  },
] as const;

export default function MapSection() {
  const { settings } = useSiteSettings();
  const email = settings?.email || contactData.email;
  const phone = settings?.phone || contactData.phone;
  const address = settings?.office_address || contactData.address;

  const values = [address, phone, email];

  return (
    <section
      className="relative overflow-hidden py-28"
      style={{
        background:
          "linear-gradient(145deg, var(--primary-dark) 0%, #0a7a1e 45%, var(--primary) 100%)",
      }}
    >
      {/* Decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-32 h-[550px] w-[550px] rounded-full opacity-[0.08] blur-3xl"
        style={{ background: "white" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-24 h-[400px] w-[400px] rounded-full opacity-[0.07] blur-3xl"
        style={{ background: "var(--accent)" }}
      />
      {/* Dot grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="container-custom relative z-10">
        {/* Section label */}
        <div className="animate-fade-up mb-12 text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold uppercase tracking-widest text-white backdrop-blur-sm"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-white/80" />
            যোগাযোগ করুন
          </span>
          <h2 className="mt-5 text-4xl font-extrabold text-white md:text-5xl">
            {contactData.heading}
          </h2>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-white/30" />
        </div>

        <div className="grid items-stretch gap-8 lg:grid-cols-2">
          {/* Contact card — glassmorphism */}
          <div
            className="animate-fade-up flex flex-col justify-between rounded-3xl p-8 shadow-2xl md:p-10"
            style={{
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.4)",
            }}
          >
            {/* Top accent bar */}
            <div
              className="mb-8 h-1 w-16 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, var(--primary-dark), var(--primary-light))",
              }}
            />

            <div className="space-y-7">
              {contactRows.map(({ icon: Icon, label, isLink, hrefPrefix }, idx) => (
                <div
                  key={label}
                  className="group flex items-start gap-5 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                  style={{
                    background: "rgba(11,143,34,0.04)",
                    border: "1px solid rgba(11,143,34,0.10)",
                  }}
                >
                  {/* Icon circle */}
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--primary-dark), var(--primary))",
                    }}
                  >
                    <Icon size={22} color="white" />
                  </span>

                  <div>
                    <p
                      className="mb-1 text-xs font-bold uppercase tracking-widest"
                      style={{ color: "var(--primary-dark)", opacity: 0.65 }}
                    >
                      {label}
                    </p>
                    {isLink ? (
                      <a
                        href={`${hrefPrefix}${values[idx]}`}
                        className="inline-flex items-center gap-1 font-semibold transition-colors duration-200 hover:underline"
                        style={{ color: "var(--primary-dark)" }}
                      >
                        {values[idx]}
                        <ExternalLink size={13} style={{ opacity: 0.5 }} />
                      </a>
                    ) : (
                      <p
                        className="leading-7 font-medium"
                        style={{ color: "var(--text-dark)" }}
                      >
                        {values[idx]}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Social row */}
            <div className="mt-10 flex items-center gap-3">
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "var(--muted)" }}
              >
                Follow us
              </span>
              <div className="flex gap-3">
                {[
                  { Icon: FaFacebookF, color: "#1877F2", label: "Facebook" },
                  { Icon: FaYoutube, color: "#FF0000", label: "YouTube" },
                ].map(({ Icon, color, label }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 hover:scale-110 hover:shadow-md"
                    style={{ background: color }}
                  >
                    <Icon size={16} color="white" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Map panel with decorative frame */}
          <div className="animate-fade-up relative">
            {/* Offset glow frame */}
            <div
              className="absolute -bottom-2 -right-2 h-full w-full rounded-3xl opacity-30"
              style={{ background: "white" }}
            />
            <div className="relative overflow-hidden rounded-3xl shadow-2xl" style={{ minHeight: 500 }}>
              {/* Top label overlay */}
              <div
                className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest text-white shadow-lg backdrop-blur-sm"
                style={{ background: "rgba(6,107,24,0.85)" }}
              >
                <Building2 size={14} />
                Office Location
              </div>
              <iframe
                src={contactData.mapEmbedUrl}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full border-0"
                style={{ minHeight: 500 }}
                title="Office location map"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}