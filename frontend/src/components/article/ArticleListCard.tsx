import Link from "next/link";
import type { Article } from "@/src/types/article";

function plainText(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function excerpt(html: string) {
  const text = plainText(html);

  if (text.length <= 500) {
    return text;
  }

  return `${text.slice(0, 500).trim()}...`;
}

export default function ArticleListCard({ article }: { article: Article }) {
  return (
    <article className="grid gap-6 border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg md:grid-cols-[320px_1fr]">
      <Link
        href={`/article/${article.slug}`}
        className="block overflow-hidden rounded-lg border border-gray-100 bg-gray-50"
      >
        {article.image_url ? (
          <img
            src={article.image_url}
            alt={article.title_en}
            className="aspect-[3/2] w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[3/2] items-center justify-center text-gray-500">
            Blog image
          </div>
        )}
      </Link>

      <Link
  href={`/article/${article.slug}`}
  className="group block"
>
  <h2 className="text-2xl font-extrabold text-gray-900 transition group-hover:text-[var(--primary)]">
    {article.title_en}
  </h2>

  <p className="mt-3 leading-8 text-gray-700">
    {excerpt(article.content_en_html)}
    <span className="ml-2 font-semibold text-[var(--primary)] group-hover:underline">
      See more →
    </span>
  </p>
</Link>
    </article>
  );
}
