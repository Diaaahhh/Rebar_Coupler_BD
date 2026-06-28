import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { API_BASE_URL } from "@/src/constants/api";
import type { Article } from "@/src/types/article";
import { siteConfig } from "@/src/lib/siteConfig";
import {
  absoluteSiteUrl,
  getSiteSettings,
  splitSeoList,
} from "@/src/lib/siteSettings";

export const dynamic = "force-dynamic";

async function getArticle(slug: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/article/slug/${slug}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { article: Article };
    return data.article;
  } catch {
    return null;
  }
}

function plainText(html: string | null | undefined) {
  return (html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [article, siteSettings] = await Promise.all([
    getArticle(slug),
    getSiteSettings(),
  ]);

  if (!article) {
    return {
      title: "Blog Not Found",
    };
  }
  const title = article.title_en;
  const content = article.content_en_html;

  const canonical = `${siteConfig.siteUrl}/article/${article.slug}`;
  const description =
    plainText(content).slice(0, 160) ||
    siteSettings.seo_description ||
    siteConfig.defaultDescription;

  const image = absoluteSiteUrl(
    article.image_url || siteSettings.og_image_url || siteConfig.defaultOgImage
  );

  return {
    title,
    description,
    keywords: splitSeoList(siteSettings.seo_keywords),
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: [
        {
          url: image,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function ArticleDetailsPage({
  params,

  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { slug } = await params;
  const { lang } = await searchParams;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const isBangla = lang === "bn";
  const title = isBangla ? article.title_bn : article.title_en;
  const content = isBangla ? article.content_bn_html : article.content_en_html;

  return (
    <article className="bg-white py-14">
      <div className="container-custom">
        {article.image_url ? (
          <div className="overflow-hidden border border-gray-200 bg-gray-50 shadow-sm">
            <img
              src={article.image_url}
              alt={title}
              className="h-[420px] w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-[360px] items-center justify-center border border-gray-200 bg-gray-50 text-gray-500">
            Blog image will appear here.
          </div>
        )}

        <div className="mx-auto mt-10 max-w-5xl">
          {/* Bangla */}
          <section>
            <h1 className="text-4xl font-extrabold leading-tight text-gray-950">
              {article.title_bn}
            </h1>

            <div
              className="product-content mt-7 text-[17px] leading-8 text-gray-800"
              dangerouslySetInnerHTML={{
                __html: article.content_bn_html,
              }}
            />
          </section>

          <hr className="my-14 border-gray-300" />

          {/* English */}
          <section>
            <h2 className="text-3xl font-extrabold text-gray-950">
              {article.title_en}
            </h2>

            <div
              className="product-content mt-7 text-[17px] leading-8 text-gray-800"
              dangerouslySetInnerHTML={{
                __html: article.content_en_html,
              }}
            />
          </section>
        </div>
      </div>
    </article>
  );
}
