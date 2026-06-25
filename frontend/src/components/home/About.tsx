"use client";
import Image from "next/image";
import { Phone } from "lucide-react";
import { aboutData } from "@/src/constants/about";
import { useSiteSettings } from "@/src/hooks/useSiteSettings";

export default function About() {
  const { settings } =
    useSiteSettings();
  
  const phone =
    settings?.phone ||
    aboutData.phone;
  return (
    <section
      className="py-24"
      style={{
        background:"var(--bg-gray)",
      }}
    >
      <div className="container-custom">
        {/* Banner */}
        <div
          className="
            animate-fade-up
            flex
            justify-center
          "
        >
          <div
            className="
              overflow-hidden
              rounded-3xl
              shadow-xl
              transition-all
              duration-500
              hover:shadow-2xl
              hover:-translate-y-1
            "
          >
            <Image
              src={aboutData.bannerImage}
              alt="Rebar Coupler Banner"
              width={1200}
              height={400}
              className="
                w-full
                max-w-[900px]
                h-auto
              "
            />
          </div>
        </div>

        {/* About Content */}
        <div
          className="
            mt-16
            max-w-5xl
            mx-auto
            animate-fade-up
          "
        >
          <div
            className="
              rounded-3xl
              p-8
              md:p-10
              border
            "
            style={{
              borderColor: "var(--accent)",
              background: "var(--bg-light)",
            }}
          >
            <div
              className="
                space-y-7
                text-[17px]
                leading-9
              "
              style={{
                color: "var(--text-dark)",
              }}
            >
              {aboutData.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div
          className="
            mt-16
            animate-fade-up
          "
        >
          <div
            className="
              rounded-3xl
              px-8
              md:px-14
              py-10
              shadow-xl
              flex
              flex-col
              lg:flex-row
              items-center
              justify-between
              gap-6
            "
            style={{
              background:
                "linear-gradient(135deg,var(--primary-dark),var(--primary))",
            }}
          >
            <h3
              className="
                text-xl
                md:text-3xl
                font-bold
                text-center
                lg:text-left
              "
              style={{
                color: "var(--text-light)",
              }}
            >
              {aboutData.ctaText}
            </h3>

            <a
              href={`tel:${phone}`}
              className="
                animate-float
                inline-flex
                items-center
                gap-3
                px-10
                py-4
                rounded-full
                font-bold
                transition-all
                duration-300
                hover:scale-105
              "
              style={{
                background: "var(--accent)",
                color: "var(--primary-dark)",
              }}
            >
              <Phone size={20} />
              {phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}