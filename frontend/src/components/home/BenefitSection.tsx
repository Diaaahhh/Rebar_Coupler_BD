"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/src/constants/api";
import { useSiteSettings } from "@/src/hooks/useSiteSettings";

const accentColors = [
  "rgba(11,143,34,0.10)",
  "rgba(31,111,178,0.10)",
  "rgba(227,27,35,0.09)",
  "rgba(11,143,34,0.10)",
  "rgba(31,111,178,0.10)",
  "rgba(227,27,35,0.09)",
];
const iconColors = [
  "var(--primary)",
  "var(--secondary)",
  "var(--accent)",
  "var(--primary)",
  "var(--secondary)",
  "var(--accent)",
];

interface BenefitItem {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  sort_order: number;
}

interface BenefitResponse {
  section: {
    heading: string;
    subheading: string;
  };

  benefits: BenefitItem[];
}
export default function BenefitSection() {
  const [data, setData] = useState<BenefitResponse | null>(null);
  const { settings } = useSiteSettings();
  useEffect(() => {

  const loadBenefits = async () => {

    try {

      const res = await fetch(
        `${API_BASE_URL}/api/benefits`,
        {
          cache: "no-store",
        }
      );

      const json = await res.json();

      setData(json);

    } catch (err) {
      console.error(err);
    }

  };

  loadBenefits();

}, []);

if (!data) {
  return (
    <section className="py-28">
      <div className="container-custom">
        Loading...
      </div>
    </section>
  );
}
  return (
    <section
      className="relative overflow-hidden py-28"
      style={{ background: "var(--bg-light)" }}
    >
      {/* Background decoration */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-[600px] w-[600px] -translate-y-1/3 translate-x-1/3 rounded-full opacity-[0.05] blur-3xl"
        style={{ background: "var(--primary)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-[400px] w-[400px] -translate-x-1/3 translate-y-1/3 rounded-full opacity-[0.05] blur-3xl"
        style={{ background: "var(--secondary)" }}
      />

      <div className="container-custom relative z-10">
        {/* Heading */}
        <div className="animate-fade-up mb-16 text-center">
          <span
            className="mb-4 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold uppercase tracking-widest"
            style={{
              background: "rgba(11,143,34,0.08)",
              color: "var(--primary-dark)",
              border: "1px solid rgba(11,143,34,0.18)",
            }}
          >
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: "var(--primary)" }}
            />
            Key Advantages
          </span>

          <h2
            className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl"
            style={{ color: "var(--primary-dark)" }}
          >
           {data.section.heading}
          </h2>

          {/* Gradient underline */}
          <div className="mx-auto mt-5 h-1 w-20 rounded-full" style={{
            background: "linear-gradient(90deg, var(--primary-dark), var(--primary-light))"
          }} />

          <p
            className="mx-auto mt-6 max-w-3xl text-lg leading-8"
            style={{ color: "var(--muted)" }}
          >
            {data.section.subheading}
          </p>
        </div>

        {/* Benefits grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.benefits.map((item, index) => (
            <div
              key={index}
              className={`group relative overflow-hidden rounded-2xl p-6 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl animate-fade-up delay-${(index % 6) + 1}`}
              style={{
                background: "var(--bg-light)",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              {/* Hover gradient flood */}
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background: `linear-gradient(135deg, ${accentColors[index]} 0%, transparent 70%)`,
                }}
              />

              {/* Top accent bar */}
              <div
                className="absolute left-0 top-0 h-[3px] w-0 rounded-t-2xl transition-all duration-500 group-hover:w-full"
                style={{
                  background: `linear-gradient(90deg, var(--primary-dark), var(--primary-light))`,
                }}
              />

              <div className="relative z-10 flex items-center gap-5">
                {/* Icon box */}
                <div
                  className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-2xl shadow-sm transition-all duration-400 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-md"
                  style={{ background: accentColors[index], border: `1.5px solid ${iconColors[index]}22` }}
                >
                  <Image
                    src={`${API_BASE_URL}/${item.icon}`}
                    alt={item.title}
                    width={38}
                    height={38}
                    unoptimized
                    className="transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Text */}
                <div>
                  <h3
                    className="text-[17px] font-bold leading-snug transition-all duration-300 group-hover:translate-x-1"
                    style={{ color: "var(--text-dark)" }}
                  >
                    {item.title}
                    <p
  className="mt-2 text-sm leading-6"
  style={{ color: "var(--muted)" }}
>
  {item.subtitle}
</p>
                  </h3>
                  {/* Subtle number badge */}
                  <span
                    className="mt-1 inline-block text-xs font-semibold uppercase tracking-widest"
                    style={{ color: iconColors[index], opacity: 0.65 }}
                  >
                    0{index + 1}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        
      </div>
    </section>
  );
}