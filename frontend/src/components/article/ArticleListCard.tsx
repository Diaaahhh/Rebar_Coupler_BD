import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import type { Article } from "@/src/types/article";

function plainText(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function excerpt(html: string, max = 160) {
  const text = plainText(html);
  return text.length <= max ? text : `${text.slice(0, max).trimEnd()}…`;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

export default function ArticleListCard({ article }: { article: Article }) {
  const date = formatDate(article.updated_at);

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-400 hover:-translate-y-1 hover:shadow-xl md:flex-row"
      style={{ border: "1px solid rgba(0,0,0,0.07)" }}
    >
      {/* Hover top-accent bar */}
      <div
        className="absolute left-0 top-0 h-[3px] w-0 rounded-t-2xl transition-all duration-500 group-hover:w-full"
        style={{
          background:
            "linear-gradient(90deg, var(--primary-dark), var(--primary-light))",
        }}
      />

      {/* Thumbnail */}
      <Link
        href={`/article/${article.slug}`}
        className="relative block shrink-0 overflow-hidden md:w-72 lg:w-80"
        tabIndex={-1}
        aria-hidden
      >
        {article.image_url ? (
          <img
            src={article.image_url}
            alt={article.title_en}
            className="aspect-[3/2] h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 md:aspect-auto"
          />
        ) : (
          <div
            className="flex aspect-[3/2] h-full w-full items-center justify-center text-sm font-medium md:aspect-auto"
            style={{
              background:
                "linear-gradient(135deg, rgba(11,143,34,0.06) 0%, rgba(11,143,34,0.12) 100%)",
              color: "var(--primary-dark)",
            }}
          >
            No Image
          </div>
        )}

        {/* Subtle overlay on hover */}
        <div className="absolute inset-0 bg-black/0 transition-colors duration-400 group-hover:bg-black/10" />
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-7">
        <div>
          {/* Date badge */}
          {date && (
            <span
              className="mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                background: "rgba(11,143,34,0.08)",
                color: "var(--primary-dark)",
                border: "1px solid rgba(11,143,34,0.15)",
              }}
            >
              <CalendarDays size={11} />
              {date}
            </span>
          )}

          {/* Title */}
          <Link href={`/article/${article.slug}`}>
            <h2
              className="text-xl font-extrabold leading-snug transition-colors duration-200 group-hover:text-[var(--primary-dark)] md:text-2xl"
              style={{ color: "var(--text-dark)" }}
            >
              {article.title_en}
            </h2>
          </Link>

          {/* Excerpt */}
          <p
            className="mt-3 text-[15px] leading-7"
            style={{ color: "var(--muted)" }}
          >
            {excerpt(article.content_en_html)}
          </p>
        </div>

        {/* Read more */}
        <Link
          href={`/article/${article.slug}`}
          className="mt-6 inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-300 hover:gap-3 hover:shadow-md"
          style={{
            background: "var(--primary-dark)",
            color: "white",
          }}
        >
          Read Article
          <ArrowRight size={15} />
        </Link>
      </div>
    </article>
  );
}
