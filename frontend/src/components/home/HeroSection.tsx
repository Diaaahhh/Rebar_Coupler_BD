"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { heroData } from "@/src/constants/hero";

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    setCurrentSlide((prev) =>
      (prev + 1) % heroData.slides.length
    );
  }, 5000);

  return () => clearInterval(interval);
}, []);
  return (
    <section
      className="
        relative
        overflow-hidden
      "
    >
      {/* Background */}
      <div className="absolute inset-0">

  {heroData.slides.map((image, index) => (

    <Image
      key={index}
      src={image}
      alt={`Hero ${index + 1}`}
      fill
      priority={index === 0}
      className={`
        object-cover
        transition-opacity
        duration-1000
        ease-in-out
        ${currentSlide === index ? "opacity-100 scale-105" : "opacity-0"}
      `}
    />

  ))}

</div>

      {/* Overlay */}
     <div
  className="absolute inset-0"
  style={{
    background:
      "linear-gradient(120deg, rgba(6,107,24,.75), rgba(31,111,178,.60), rgba(0,0,0,.45))",
  }}
/>

      {/* Content */}
      <div className="relative z-10">
        <div className="container-custom">
          <div
            className="
              min-h-[700px]
              flex
              items-center
            "
          >
            <div
              className="
                grid
                lg:grid-cols-2
                gap-16
                items-center
                w-full
              "
            >
              {/* LEFT */}
              <div
                className="
                  text-white
                  animate-[fadeIn_1s_ease]
                "
              >
                <h1
  className="
    text-5xl
    lg:text-7xl
    font-bold
    leading-tight
    opacity-0
    animate-[slideUp_.8s_ease_forwards]
  "
>
                  {heroData.title}
                </h1>

                <h2
  className="
    mt-4
    text-3xl
    lg:text-5xl
    font-bold
    opacity-0
    animate-[slideUp_.8s_ease_.25s_forwards]
  "
>
                  {heroData.subtitle}
                </h2>

                <p
  className="
    mt-8
    text-lg
    leading-9
    text-white/90
    max-w-[700px]
    opacity-0
    animate-[slideUp_.8s_ease_.5s_forwards]
  "
>
                  {heroData.description}
                </p>

                <div
  className="
    mt-10
    flex
    flex-wrap
    gap-5
    opacity-0
    animate-[slideUp_.8s_ease_.8s_forwards]
  "
>
                  <Link
                    href={heroData.buttonOne.href}
                    className="
                      px-8
                      py-4
                      font-semibold
                      transition-all
                      duration-300
                      hover:-translate-y-1
                    "
                    style={{
                      background:
                        "var(--accent)",
                      color:
                        "var(--text-dark)",
                    }}
                  >
                    {heroData.buttonOne.text}
                  </Link>

                  <Link
                    href={heroData.buttonTwo.href}
                    className="
                      px-8
                      py-4
                      border
                      transition-all
                      duration-300
                      hover:-translate-y-1
                    "
                    style={{
                      borderColor:
                        "var(--accent)",
                    }}
                  >
                    {heroData.buttonTwo.text}
                  </Link>
                </div>
              </div>

              {/* RIGHT */}
              <div
  className="
    hidden
    lg:flex
    items-center
    justify-center
  "
>
  <div
    className="
      grid
      grid-cols-2
      gap-6
      w-full
      max-w-lg
    "
  >
    {[
      "Mechanical Splicing",
      "High Strength",
      "ISO Standard",
      "Nationwide Supply",
    ].map((item) => (
      <div
        key={item}
        className="
          rounded-xl
          backdrop-blur-md
          border
          p-6
          text-center
          text-white
          bg-white/10
          border-white/20
          hover:bg-white/20
          transition-all
          duration-300
        "
      >
        <div className="text-2xl font-bold mb-2">
          ✓
        </div>

        <p>{item}</p>
      </div>
    ))}
  </div>
</div>
            </div>
          </div>
        </div>
      </div>
      <div
  className="
    absolute
    bottom-8
    left-1/2
    -translate-x-1/2
    flex
    gap-3
    z-20
  "
>
  {heroData.slides.map((_, index) => (
    <button
      key={index}
      onClick={() => setCurrentSlide(index)}
      className={`
        h-3
        w-3
        rounded-full
        transition-all
        duration-300
        ${
          currentSlide === index
            ? "bg-white w-8"
            : "bg-white/50"
        }
      `}
    />
  ))}
</div>
    </section>
  );
}