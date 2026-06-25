"use client";
import Image from "next/image";
import { Phone } from "lucide-react";
import { benefitData } from "@/src/constants/benefits";
import { useSiteSettings } from "@/src/hooks/useSiteSettings";

export default function BenefitSection() {
  const { settings } =
  useSiteSettings();

const phone =
  settings?.phone ||
  benefitData.phone;
  return (
    <section
      className="py-24"
      style={{
        background: "var(--bg-light)",
      }}
    >
      <div className="container-custom">
        {/* Heading */}
        <div className="text-center animate-fade-up">
          <h2
            className="
              text-4xl
              md:text-5xl
              font-bold
            "
            style={{
              color: "var(--primary-dark)",
            }}
          >
            {benefitData.heading}
          </h2>

          <div
            className="
              w-24
              h-1
              mx-auto
              mt-5
              rounded-full
            "
            style={{
              background: "var(--primary)",
            }}
          />

          <p
            className="
              mt-6
              max-w-3xl
              mx-auto
              text-lg
              leading-8
            "
            style={{
              color: "var(--text-dark)",
            }}
          >
            {benefitData.subHeading}
          </p>
        </div>

        {/* Benefits Grid */}
        <div
          className="
            mt-16
            grid
            md:grid-cols-2
            gap-6
          "
        >
          {benefitData.items.map((item, index) => (
            <div
              key={index}
              className="
                group
    flex
    items-center
    gap-5
    p-5
    rounded-2xl
    border
    transition-all
    duration-500
    hover:-translate-y-2
    hover:shadow-2xl
    animate-fade-up
    delay-${(index % 6) + 1}
              "
              style={{
                background: "var(--bg-light)",
                borderColor: "var(--accent)",
              }}
            >
              <div
                className="
                  flex
    items-center
    justify-center
    w-20
    h-20
    rounded-xl
    shrink-0
    transition-all
    duration-300
    group-hover:scale-110
    group-hover:rotate-3
                "
                style={{
                  background: "var(--accent)",
                }}
              >
                <Image
                  src={item.icon}
                  alt={item.title}
                  width={42}
                  height={42}
                />
              </div>

              <h3
                className="
                  text-xl
    font-semibold
    transition-all
    duration-300
    group-hover:translate-x-2
                "
                style={{
                  color: "var(--text-dark)",
                }}
              >
                {item.title}
              </h3>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className="
  mt-20
  rounded-3xl
  p-10
  text-center
  shadow-2xl
  animate-fade-up
"
          style={{
            background:
              "linear-gradient(135deg,var(--primary),var(--primary-dark))",
          }}
        >
          <h3
            className="
              text-2xl
              md:text-3xl
              font-bold
            "
            style={{
              color: "var(--text-light)",
            }}
          >
            যেকোনো প্রয়োজনে Call অথবা WhatsApp
          </h3>

          <a
            href={`tel:${phone}`}
            className="
  inline-flex
  items-center
  gap-3
  mt-8
  px-10
  py-4
  rounded-full
  font-bold
  transition-all
  duration-300
  hover:scale-110
  animate-float
"
            style={{
              background: "var(--accent)",
              color: "var(--text-dark)",
            }}
          >
            <Phone size={18} />
            {phone}
          </a>
        </div>
      </div>
    </section>
  );
}