import Link from "next/link";
import type { Article } from "@/src/types/article";

const banglaButtonText =
  "\u09ac\u09be\u0982\u09b2\u09be\u09af\u09bc \u09aa\u09a1\u09bc\u09c1\u09a8";

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
        href={`/article/${article.slug}?lang=en`}
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
            Article image
          </div>
        )}
      </Link>

      <div>
        <Link href={`/article/${article.slug}?lang=en`}>
          <h2 className="text-2xl font-extrabold text-gray-900 hover:text-[var(--primary)]">
            {article.title_en}
          </h2>
        </Link>
        <p className="mt-3 leading-8 text-gray-700">
          {excerpt(article.content_en_html)}
        </p>

        <div className="mt-6 flex max-w-xl items-center">
          <Link
            href={`/article/${article.slug}?lang=bn`}
            className="flex-1 bg-[#111b3d] px-6 py-4 text-center text-xl font-extrabold text-white transition hover:bg-[#0b1228]"
          >
            {banglaButtonText}
          </Link>
          <span className="z-10 -mx-5 flex h-12 w-12 items-center justify-center rounded-full bg-white text-sm font-medium text-black shadow">
            Or
          </span>
          <Link
            href={`/article/${article.slug}?lang=en`}
            className="flex-1 bg-[#faffb8] px-6 py-4 text-center text-xl font-extrabold text-black transition hover:bg-[#f3faa1]"
          >
            In English
          </Link>
        </div>
      </div>
    </article>
  );
}
