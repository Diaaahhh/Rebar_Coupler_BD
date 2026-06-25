import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { API_BASE_URL } from "@/src/constants/api";
import ProductGallery from "@/src/components/products/ProductGallery";
import type { Product } from "@/src/types/product";
import ProductQueryModal from "@/src/components/products/ProductQueryModal";
import { siteConfig } from "@/src/lib/siteConfig";
import {
  absoluteSiteUrl,
  getSiteSettings,
  splitSeoList,
} from "@/src/lib/siteSettings";

export const dynamic = "force-dynamic";

type ProductDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function getProduct(slug: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/slug/${slug}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { product: Product };
    return data.product;
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
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [product, siteSettings] = await Promise.all([
    getProduct(slug),
    getSiteSettings(),
  ]);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  const title = product.seo_title || product.name;
  const description =
    product.seo_description ||
    plainText(product.short_description_html) ||
    siteSettings.seo_description ||
    siteConfig.defaultDescription;
  const image = absoluteSiteUrl(
    product.main_image_url ||
      siteSettings.og_image_url ||
      siteConfig.defaultOgImage
  );
  const canonical = `${siteConfig.siteUrl}/products/${product.slug}`;

  return {
    title,
    description,
    keywords: splitSeoList(product.seo_keywords || siteSettings.seo_keywords),
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
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    other: {
      tag: product.seo_tags || siteSettings.seo_tags || "",
      "ia:markup_url": canonical,
      "ia:markup_url_dev": canonical,
      "ia:rules_url": canonical,
      "ia:rules_url_dev": canonical,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  return (
    <section className="py-14">
      <div className="container-custom">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
          <ProductGallery
            name={product.name}
            images={product.images || []}
            fallbackImage={product.main_image_url}
          />

          <div className="border border-gray-200 bg-white">
            <div className="border-b border-gray-200 p-5">
              <p className="text-sm font-semibold uppercase tracking-[3px] text-[var(--primary)]">
                Product Details
              </p>
              <h1 className="mt-2 text-3xl font-bold text-gray-900">
                {product.name}
              </h1>
            </div>

            <div className="grid gap-0">
              <div className="p-5">
                <h2 className="mb-3 text-lg font-bold text-gray-900">
                  Details of this product
                </h2>
                <div
                  className="product-content text-gray-700"
                  dangerouslySetInnerHTML={{
                    __html: product.details_html || "",
                  }}
                />
                <div className="mt-5 border-t border-gray-200 pt-4">
  <p className="font-bold text-gray-900">
    Any query?{" "}
    <ProductQueryModal
      productId={product.id}
      productName={product.name}
    />
    {" "}or{" "}
    <a
      href={`tel:${product.query_phone}`}
      className="text-red-600"
    >
      {product.query_phone}
    </a>
  </p>
</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border border-gray-200 bg-white p-6 md:p-8">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            Why use this product
          </h2>
          <div
            className="product-content text-gray-700"
            dangerouslySetInnerHTML={{
              __html: product.short_description_html,
            }}
          />
        </div>
      </div>
    </section>
  );
}
