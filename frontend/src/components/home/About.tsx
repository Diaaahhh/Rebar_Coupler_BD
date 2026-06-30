"use client";
import Image from "next/image";
import { Phone, ShieldCheck, Award, MapPin } from "lucide-react";
import { aboutData } from "@/src/constants/about";
import { useSiteSettings } from "@/src/hooks/useSiteSettings";

const highlights = [
  { icon: ShieldCheck, label: "6+ Years", sub: "Trusted Experience" },
  { icon: Award, label: "BUET", sub: "Consultant Backed" },
  { icon: MapPin, label: "Nationwide", sub: "Coverage" },
];

export default function About() {
  const { settings } = useSiteSettings();
  const phone = settings?.phone || aboutData.phone;

  return (
    <section className="relative overflow-hidden py-28" style={{ background: "var(--bg-gray)" }}>
      {/* Decorative background blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full opacity-[0.07] blur-3xl"
        style={{ background: "var(--primary)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 bottom-0 h-[400px] w-[400px] rounded-full opacity-[0.06] blur-3xl"
        style={{ background: "var(--accent)" }}
      />

      <div className="container-custom relative z-10">
        {/* Section label */}
        <div className="animate-fade-up mb-6 flex justify-center">
          <span
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold tracking-widest uppercase"
            style={{
              background: "rgba(11,143,34,0.1)",
              color: "var(--primary-dark)",
              border: "1px solid rgba(11,143,34,0.2)",
            }}
          >
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: "var(--primary)" }}
            />
            Who We Are
          </span>
        </div>

        {/* Banner image with layered frame */}
        <div className="animate-fade-up relative mx-auto max-w-4xl">
          {/* Decorative offset frame */}
          <div
            className="absolute -bottom-3 -right-3 h-full w-full rounded-3xl"
            style={{ background: "var(--primary)", opacity: 0.12 }}
          />
          
        </div>

        {/* Highlight stats row */}
        <div className="animate-fade-up delay-1 mx-auto mt-12 grid max-w-3xl grid-cols-3 gap-4">
          {highlights.map(({ icon: Icon, label, sub }) => (
            <div
              key={label}
              className="group flex flex-col items-center gap-2 rounded-2xl p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              style={{
                background: "var(--bg-light)",
                border: "1px solid rgba(11,143,34,0.15)",
              }}
            >
              <span
                className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                style={{ background: "rgba(11,143,34,0.1)" }}
              >
                <Icon size={22} style={{ color: "var(--primary)" }} />
              </span>
              <p className="text-xl font-extrabold" style={{ color: "var(--primary-dark)" }}>
                {label}
              </p>
              <p className="text-xs font-medium" style={{ color: "var(--muted)" }}>
                {sub}
              </p>
            </div>
          ))}
        </div>

        {/* About text card */}
        <div className="animate-fade-up delay-2 relative mx-auto mt-12 max-w-5xl">
          <div
            className="relative overflow-hidden rounded-3xl p-8 md:p-12 shadow-xl"
            style={{
              background: "var(--bg-light)",
              border: "1px solid rgba(11,143,34,0.12)",
            }}
          >
            {/* Accent bar */}
            <div
              className="absolute left-0 top-0 h-1 w-full rounded-t-3xl"
              style={{
                background: "linear-gradient(90deg, var(--primary-dark), var(--primary), var(--primary-light))",
              }}
            />

            <div className="space-y-6 text-[17px] leading-[1.95]" style={{ color: "var(--text-dark)" }}>
              {aboutData.paragraphs.map((paragraph, index) => (
                <p key={index} className={index === 0 ? "font-medium" : ""}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>

     
      </div>
    </section>
  );
}