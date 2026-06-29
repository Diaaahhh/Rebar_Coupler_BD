"use client";
import { Building2, Phone, Mail, ExternalLink, MapPin } from "lucide-react";
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
      className="relative overflow-hidden py-32"
      style={{ background: "var(--bg-gray)" }}
    >
      <div className="container-custom relative z-10">
        {/* Outer Split Card */}
        <div
          className="animate-fade-up relative flex flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] lg:flex-row"
          style={{ border: "1px solid rgba(0,0,0,0.05)" }}
        >
          {/* Left Side: Contact Details */}
          <div
            className="relative flex flex-col justify-center p-10 lg:w-[45%] lg:p-16 xl:p-20"
            style={{
              background:
                "linear-gradient(145deg, var(--primary-dark) 0%, #0a7a1e 50%, var(--primary) 100%)",
            }}
          >
            {/* Background Texture for Left Panel */}
            <div
              className="pointer-events-none absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle at center, white 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            <div
              className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white opacity-5 blur-[80px]"
            />
            <div
              className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-black opacity-10 blur-[80px]"
            />

            <div className="relative z-10">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md">
                <MapPin size={14} />
                Get In Touch
              </span>
              <h2 className="mb-8 text-4xl font-extrabold text-white md:text-5xl">
                {contactData.heading}
              </h2>

              <div className="mb-10 h-1 w-12 rounded-full bg-white/30" />

              <div className="space-y-8">
                {contactRows.map(
                  ({ icon: Icon, label, isLink, hrefPrefix }, idx) => (
                    <div key={label} className="group flex items-start gap-5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-md transition-transform duration-300 group-hover:scale-110 group-hover:bg-white/20">
                        <Icon size={22} />
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-white/60">
                          {label}
                        </p>
                        {isLink ? (
                          <a
                            href={`${hrefPrefix}${values[idx]}`}
                            className="inline-flex items-center gap-1.5 text-lg font-semibold text-white transition-colors duration-200 hover:text-white/80"
                          >
                            {values[idx]}
                            <ExternalLink size={14} className="opacity-60" />
                          </a>
                        ) : (
                          <p className="text-lg font-medium leading-relaxed text-white">
                            {values[idx]}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Social row */}
              <div className="mt-12 flex items-center gap-4 border-t border-white/10 pt-8">
                <span className="text-xs font-bold uppercase tracking-widest text-white/60">
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
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-300 hover:scale-110 hover:shadow-lg"
                      style={{ hover: { background: color } }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = color)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "")
                      }
                    >
                      <Icon size={18} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Google Map */}
          <div className="relative min-h-[400px] lg:h-auto lg:w-[55%]">
            <iframe
              src={contactData.mapEmbedUrl}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0 grayscale filter transition-all duration-700 hover:grayscale-0"
              title="Office location map"
            />
            {/* Interactive Map Overlay Hint */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/10 text-white opacity-0 transition-opacity duration-300 hover:opacity-100">
              <span className="rounded-full bg-black/60 px-6 py-3 font-semibold backdrop-blur-md">
                Interactive Map
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}