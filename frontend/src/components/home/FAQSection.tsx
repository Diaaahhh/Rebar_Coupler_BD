import { faqData } from "@/src/constants/faq";
import { HelpCircle } from "lucide-react";

export default function FAQSection() {
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
            {faqData.heading}
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
        </div>

        {/* FAQ Grid */}
        <div
          className="
            mt-16
            grid
            md:grid-cols-2
            gap-8
          "
        >
          {faqData.items.map((faq, index) => (
            <div
              key={index}
              className={`
                rounded-2xl
                overflow-hidden
                border
                shadow-lg
                transition-all
                duration-300
                hover:-translate-y-2
                hover:shadow-2xl
                animate-fade-up
                delay-${index + 1}
              `}
              style={{
                borderColor: "var(--accent)",
                background: "white",
              }}
            >
              {/* Question */}
              <div
                className="
                  px-6
                  py-5
                  flex
                  items-center
                  gap-3
                "
                style={{
                  background:
                    "linear-gradient(135deg,var(--primary-dark),var(--primary))",
                }}
              >
                <HelpCircle
                  size={22}
                  style={{
                    color: "var(--accent-hover)",
                  }}
                />

                <h3
                  className="
                    font-bold
                    text-lg
                    leading-7
                  "
                  style={{
                    color: "var(--text-light)",
                  }}
                >
                  {faq.question}
                </h3>
              </div>

              {/* Answer */}
              <div className="p-6">
                <p
                  className="
                    leading-8
                    text-[16px]
                  "
                  style={{
                    color: "var(--text-dark)",
                  }}
                >
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}