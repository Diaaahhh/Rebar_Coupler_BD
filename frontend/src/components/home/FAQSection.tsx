"use client";
import { ChevronDown, MessageCircleQuestion } from "lucide-react";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/src/constants/api";

interface FAQItem {
  id: number;
  title: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: number;
}

export default function FAQSection() {

  const [openIndex, setOpenIndex] = useState<number | null>(null);
const [faqs, setFaqs] = useState<FAQItem[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadFaqs = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/faq`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      setFaqs(data);
    } catch (err) {
      console.error("Failed to load FAQs:", err);
    } finally {
      setLoading(false);
    }
  };

  loadFaqs();
}, []);

  const toggle = (index: number) =>
    setOpenIndex((prev) => (prev === index ? null : index));

  if (loading) {
  return (
    <section className="py-28">
      <div className="container-custom text-center">
        Loading...
      </div>
    </section>
  );
}

  return (
    <section
      className="relative overflow-hidden flex justify-center"
      style={{ background: "var(--bg-light)" }}
    >
      <div className="formatted_body">
 {/* Background blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-0 h-[500px] w-[500px] -translate-y-1/3 rounded-full opacity-[0.06] blur-3xl"
        style={{ background: "var(--primary)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-0 h-[400px] w-[400px] translate-y-1/3 rounded-full opacity-[0.05] blur-3xl"
        style={{ background: "var(--secondary)" }}
      />

      <div className="container-custom relative z-10">
        {/* Heading */}
        <div className="animate-fade-up mb-14 text-center">
          <span
            className="mb-4 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold uppercase tracking-widest"
            style={{
              background: "rgba(11,143,34,0.08)",
              color: "var(--primary-dark)",
              border: "1px solid rgba(11,143,34,0.18)",
            }}
          >
            <MessageCircleQuestion size={14} style={{ color: "var(--primary)" }} />
            FAQ
          </span>

          <h2
            className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl"
            style={{ color: "var(--primary-dark)" }}
          >
            {faqs.length > 0
  ? faqs[0].title
  : "Frequently Asked Questions"}
          </h2>

          <div
            className="mx-auto mt-5 h-1 w-20 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, var(--primary-dark), var(--primary-light))",
            }}
          />
        </div>

        {/* Accordion list */}
        <div className="mx-auto max-w-3xl space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className={`animate-fade-up delay-${index + 1} overflow-hidden rounded-2xl shadow-sm transition-all duration-300 ${
                  isOpen ? "shadow-lg" : "hover:shadow-md"
                }`}
                style={{
                  background: "var(--bg-light)",
                  border: isOpen
                    ? "1.5px solid rgba(11,143,34,0.35)"
                    : "1.5px solid rgba(0,0,0,0.07)",
                }}
              >
                {/* Question trigger */}
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-7 py-5 text-left transition-colors duration-200"
                  style={{
                    background: isOpen
                      ? "linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%)"
                      : "var(--bg-light)",
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Number badge */}
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold transition-colors duration-200"
                      style={{
                        background: isOpen
                          ? "rgba(255,255,255,0.18)"
                          : "rgba(11,143,34,0.10)",
                        color: isOpen ? "white" : "var(--primary-dark)",
                      }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span
                      className="text-[16px] font-bold leading-snug"
                      style={{ color: isOpen ? "white" : "var(--text-dark)" }}
                    >
                      {faq.question}
                    </span>
                  </div>

                  <ChevronDown
                    size={20}
                    className="shrink-0 transition-transform duration-300"
                    style={{
                      color: isOpen ? "white" : "var(--primary)",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </button>

                {/* Answer panel */}
                <div
                  className="overflow-hidden transition-all duration-500 ease-in-out"
                  style={{
                    maxHeight: isOpen ? "400px" : "0px",
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <div
                    className="relative px-7 py-6"
                    style={{ borderTop: "1px solid rgba(11,143,34,0.10)" }}
                  >
                    {/* Left accent line */}
                    <div
                      className="absolute left-0 top-6 bottom-6 w-1 rounded-full"
                      style={{ background: "var(--primary)", opacity: 0.4 }}
                    />
                    <p
                      className="pl-3 text-[16px] leading-8"
                      style={{ color: "var(--text-dark)" }}
                    >
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </div>
     
    </section>
  );
}