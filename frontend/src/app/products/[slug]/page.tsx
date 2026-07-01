import type { Metadata } from "next";
import Link from "next/link";
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

async function getProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as { products: Product[] };
    return data.products;
  } catch {
    return [];
  }
}

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

async function getContactSettings() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/contact/settings`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.settings;
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
 const [product, contactSettings, products] = await Promise.all([
  getProduct(slug),
  getContactSettings(),
  getProducts(),
]);

if (!product) {
  notFound();
}

  return (
    <section className="py-14"
    style={{
      marginTop: "60px"
    }}>
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
  Product Specifications
</h2>

<div className="overflow-hidden rounded border border-gray-200">
  <table className="w-full border-collapse">
    <tbody>

      <tr>
        <td className="border px-4 py-2 arial-black">
          Available Size (mm)
        </td>

        <td className="border px-4 py-2 font-bold">
          {product.available_size}
        </td>
      </tr>

      <tr>
        <td className="border px-4 py-2 arial-black">
          Quality Test
        </td>

        <td className="border px-4 py-2 font-bold">
          {product.quality_test}
        </td>
      </tr>

      <tr>
        <td className="border px-4 py-2 arial-black">
          Pricing System
        </td>

        <td className="border px-4 py-2 font-bold">
          {product.pricing_system}
        </td>
      </tr>

      <tr>
        <td className="border px-4 py-2 arial-black">
          Sample Test System
        </td>

        <td className="border px-4 py-2 font-bold">
          {product.sample_test_system}
        </td>
      </tr>

      <tr>
        <td className="border px-4 py-2 arial-black">
          Threading & Forging
        </td>

        <td className="border px-4 py-2 font-bold">
          {product.threading_forging}
        </td>
      </tr>

      <tr>
  <td className="border px-4 py-2 arial-black">
    Installation Team
  </td>

  <td className="border px-4 py-2 font-bold">
    {product.installing_team || "-"}
  </td>
</tr>

    </tbody>
  </table>
</div>
                <div className="mt-5 border-t border-gray-200 pt-4">
                  <p className="font-bold text-gray-900">
                    Any query?{" "}
                    <ProductQueryModal
                      productId={product.id}
                      productName={product.name}
                    />{" "}
                    or{" "}
                    <a
  href={`tel:${contactSettings?.phone}`}
  className="text-red-600"
>
  {contactSettings?.phone}
</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">

  {/* Left */}
  <div className="border border-gray-200 bg-white p-6 md:p-8">
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

  {/* Right */}
  <aside className="border border-gray-200 bg-white p-5">
    <h3 className="mb-5 text-xl font-bold text-gray-900">
      Our Products
    </h3>

    <div className="space-y-4">
      {products
        .filter((item) => item.id !== product.id)
        .map((item) => (
          <Link
            key={item.id}
            href={`/products/${item.slug}`}
            className="flex items-center gap-3 rounded border border-gray-200 p-2 transition hover:border-[var(--primary)] hover:bg-gray-50"
          >
            <img
              src={item.main_image_url || "/Anda-rebar-couplers.webp"}
              alt={item.name}
              className="h-16 w-16 flex-shrink-0 object-contain"
            />

            <div className="min-w-0">
              <p className="line-clamp-2 text-sm font-semibold text-gray-900">
                {item.name}
              </p>
            </div>
          </Link>
        ))}
    </div>
  </aside>

</div>
      </div>
    </section>
  );
}
