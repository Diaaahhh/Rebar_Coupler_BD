import Link from "next/link";
import Image from "next/image";
import { heroData } from "@/src/constants/hero";

export default function HeroSection() {
  return (
    <section
      className="
        relative
        overflow-hidden
      "
    >
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/hero.jpg"
          alt="Hero Background"
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "rgba(35,111,134,0.85)",
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
                  "
                >
                  {heroData.title}
                </h1>

                <h2
                  className="
                    mt-4
                    text-4xl
                    lg:text-6xl
                    font-bold
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
                  animate-[fadeIn_1.2s_ease]
                "
              >
                <div
                  className="
                    overflow-hidden
                    rounded-2xl
                    border-2
                    shadow-2xl
                  "
                  style={{
                    borderColor:
                      "rgba(255,255,255,.5)",
                  }}
                >
                  <iframe
                    src={heroData.youtubeVideo}
                    title="Rebar Coupler Video"
                    className="
                      w-full
                      aspect-video
                    "
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}