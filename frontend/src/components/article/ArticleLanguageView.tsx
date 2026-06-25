"use client";

import { useState } from "react";
import type { Article } from "@/src/types/article";

type Language = "bn" | "en";

const banglaButtonText =
  "\u09ac\u09be\u0982\u09b2\u09be\u09af\u09bc \u09aa\u09a1\u09bc\u09c1\u09a8";

export default function ArticleLanguageView({ article }: { article: Article }) {
  const [language, setLanguage] = useState<Language>("bn");
  const isBangla = language === "bn";
  const title = isBangla ? article.title_bn : article.title_en;
  const content = isBangla ? article.content_bn_html : article.content_en_html;

  return (
    <section className="bg-white py-16">
      <div className="container-custom">
        <div className="mx-auto max-w-6xl border-[6px] border-gray-100 bg-gray-50 p-6 shadow-[0_15px_45px_rgba(0,0,0,0.08)]">
          <div className="grid gap-8 lg:grid-cols-[420px_1fr] lg:items-start">
            <div className="overflow-hidden rounded-xl border border-dotted border-gray-500 bg-white p-3">
              {article.image_url ? (
                <img
                  src={article.image_url}
                  alt={title}
                  className="aspect-[3/2] w-full rounded-lg object-cover"
                />
              ) : (
                <div className="flex aspect-[3/2] items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                  Article image will appear here.
                </div>
              )}
            </div>

            <div>
              <h1 className="text-3xl font-extrabold leading-tight text-[#061978] md:text-4xl">
                {title}
              </h1>

              <div
                className="product-content mt-6 text-[17px] leading-8 text-gray-900"
                dangerouslySetInnerHTML={{ __html: content }}
              />

              <div className="mt-9 flex max-w-xl items-center">
                <button
                  type="button"
                  onClick={() => setLanguage("bn")}
                  className={`flex-1 px-6 py-4 text-xl font-extrabold transition ${
                    isBangla
                      ? "bg-[#111b3d] text-white"
                      : "bg-[#faffb8] text-black hover:bg-[#f3faa1]"
                  }`}
                >
                  {banglaButtonText}
                </button>
                <span className="z-10 -mx-5 flex h-12 w-12 items-center justify-center rounded-full bg-white text-sm font-medium text-black shadow">
                  Or
                </span>
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`flex-1 px-6 py-4 text-xl font-extrabold transition ${
                    !isBangla
                      ? "bg-[#111b3d] text-white"
                      : "bg-[#faffb8] text-black hover:bg-[#f3faa1]"
                  }`}
                >
                  In English
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
