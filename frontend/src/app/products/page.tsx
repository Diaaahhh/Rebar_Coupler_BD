import Link from "next/link";
import { API_BASE_URL } from "@/src/constants/api";
import type { Product } from "@/src/types/product";
import { generateSiteMetadata } from "@/src/lib/pageMetadata";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return generateSiteMetadata({
    path: "/products",
    fallbackTitle: "Products",
  });
}

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

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <section className="py-16">
      <div className="container-custom">
        <div className="mb-10">
          <p className="font-semibold uppercase tracking-[3px] text-[var(--primary)]">
            Products
          </p>
          <h1 className="mt-3 text-4xl font-bold text-gray-900">
            Rebar Coupler Bangladesh Products
          </h1>
        </div>

        {products.length === 0 ? (
          <div className="border border-dashed border-gray-300 p-10 text-center text-gray-600">
            No products have been added yet.
          </div>
        ) : (
          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="aspect-[3/2] bg-gray-50">
                  <img
                    src={product.main_image_url || "/Anda-rebar-couplers.webp"}
                    alt={product.name}
                    className="h-full w-full object-contain p-3"
                  />
                </div>

                <div className="p-5">
                  <h2 className="overflow-hidden text-center text-xl font-bold whitespace-nowrap text-ellipsis text-gray-900 group-hover:text-[var(--primary)]">
  {product.name}
</h2>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
