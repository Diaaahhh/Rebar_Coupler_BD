import ArticleListCard from "@/src/components/article/ArticleListCard";
import { API_BASE_URL } from "@/src/constants/api";
import type { Article } from "@/src/types/article";
import { generateSiteMetadata } from "@/src/lib/pageMetadata";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return generateSiteMetadata({
    path: "/article",
    fallbackTitle: "Blog",
  });
}

async function getArticles() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/article/list`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as { articles: Article[] };
    return data.articles;
  } catch {
    return [];
  }
}

export default async function ArticlePage() {
  const articles = await getArticles();

  return (
    <section className="bg-gray-50 py-16">
      <div className="container-custom">
        <p className="mb-6 font-semibold uppercase tracking-[3px] text-[var(--primary)]">
          Blogs
        </p>

        {articles.length === 0 ? (
          <div className="border border-gray-200 bg-white p-8 text-center text-gray-600">
            No blogs are available right now.
          </div>
        ) : (
          <div className="space-y-6">
            {articles.map((article) => (
              <ArticleListCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
